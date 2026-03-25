import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
const PDFDocument = require('pdfkit-table');

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private prisma: PrismaService) {}

  async generateAdminReport(companyId: string, startDate: string, endDate: string, res: Response) {
    try {
      const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);

      const company = await this.prisma.company.findUnique({ where: { id: companyId } });
      if (!company) throw new NotFoundException('Empresa no encontrada');

      const tickets = await this.prisma.ticket.findMany({
        where: {
          companyId,
          createdAt: { gte: start, lte: end }
        }
      });

      const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });

      // Cabeceras de respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Reporte_Foresight.pdf`);

      doc.pipe(res);

      // --- ENCABEZADO ---
      doc.rect(0, 0, doc.page.width, 80).fill('#1a73e8');
      doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('FORESIGHT AI CORE', 40, 25);
      doc.fontSize(10).font('Helvetica').text('REPORTE EJECUTIVO DE OPERACIONES', 40, 50);
      doc.fontSize(12).text(company.name.toUpperCase(), 40, 35, { align: 'right', width: doc.page.width - 80 });

      doc.moveDown(4);

      // --- INFO PERIODO ---
      doc.fillColor('#444444').fontSize(10).font('Helvetica-Bold').text(`PERIODO: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, 40, 100);

      // --- KPIs ---
      const total = tickets.length;
      const resolved = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
      const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

      doc.moveDown(2);
      
      // Dibujar cuadritos de KPIs manualmente si la tabla falla
      const kpiY = 130;
      doc.rect(40, kpiY, 150, 50).fill('#f8fafc').stroke('#e2e8f0');
      doc.fillColor('#1a73e8').fontSize(16).text(total.toString(), 40, kpiY + 10, { width: 150, align: 'center' });
      doc.fillColor('#64748b').fontSize(8).text('TOTAL TICKETS', 40, kpiY + 30, { width: 150, align: 'center' });

      doc.rect(210, kpiY, 150, 50).fill('#f8fafc').stroke('#e2e8f0');
      doc.fillColor('#10b981').fontSize(16).text(resolved.toString(), 210, kpiY + 10, { width: 150, align: 'center' });
      doc.fillColor('#64748b').fontSize(8).text('RESUELTOS', 210, kpiY + 30, { width: 150, align: 'center' });

      doc.rect(380, kpiY, 150, 50).fill('#f8fafc').stroke('#e2e8f0');
      doc.fillColor('#8b5cf6').fontSize(16).text(`${resolutionRate}%`, 380, kpiY + 10, { width: 150, align: 'center' });
      doc.fillColor('#64748b').fontSize(8).text('EFICIENCIA', 380, kpiY + 30, { width: 150, align: 'center' });

      doc.moveDown(6);

      // --- TABLA DE ÁREAS ---
      const areasData = await this.prisma.area.findMany({ 
        where: { companyId },
        include: { tickets: { where: { createdAt: { gte: start, lte: end } } } }
      });

      const areaTable = {
        title: "INCIDENCIAS POR ÁREA",
        headers: ["Nombre del Área", "Tickets", "Resueltos", "%"],
        rows: areasData.map(a => [
          a.name,
          a.tickets.length.toString(),
          a.tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length.toString(),
          a.tickets.length > 0 ? Math.round((a.tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length / a.tickets.length) * 100) + '%' : '0%'
        ])
      };

      await doc.table(areaTable, { 
        width: 500,
        x: 40,
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(9).fillColor('#444444')
      });

      doc.moveDown(2);

      // --- TABLA DE TÉCNICOS ---
      const techsData = await this.prisma.user.findMany({
        where: { companyId, role: { name: 'Técnico' } },
        include: { assignedTickets: { where: { createdAt: { gte: start, lte: end } } } }
      });

      const techTable = {
        title: "DESEMPEÑO TÉCNICO",
        headers: ["Técnico", "Asignados", "Resueltos", "Pendientes"],
        rows: techsData.map(t => {
          const tTotal = t.assignedTickets.length;
          const tRes = t.assignedTickets.filter(tk => tk.status === 'RESOLVED' || tk.status === 'CLOSED').length;
          return [t.name, tTotal.toString(), tRes.toString(), (tTotal - tRes).toString()];
        })
      };

      await doc.table(techTable, { 
        width: 500, 
        x: 40,
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(9).fillColor('#444444')
      });

      doc.end();

    } catch (error) {
      this.logger.error('Error generando PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error al generar el PDF' });
      }
    }
  }
}
