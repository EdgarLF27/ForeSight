import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateAdminReport(companyId: string, res: Response) {
    const workbook = new ExcelJS.Workbook();
    
    // 1. Sheet: Technicians Performance
    const techSheet = workbook.addWorksheet('Rendimiento Técnicos');
    techSheet.columns = [
      { header: 'Nombre', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Tickets Asignados', key: 'assigned', width: 20 },
      { header: 'Tickets Resueltos', key: 'resolved', width: 20 },
      { header: '% Resolución', key: 'rate', width: 15 },
    ];

    const technicians = await this.prisma.user.findMany({
      where: { 
        companyId,
        role: { name: { contains: 'Técnico', mode: 'insensitive' } } 
      },
      include: {
        assignedTickets: true,
      },
    });

    technicians.forEach(tech => {
      const assigned = tech.assignedTickets.length;
      const resolved = tech.assignedTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
      const rate = assigned > 0 ? ((resolved / assigned) * 100).toFixed(2) + '%' : '0%';
      
      techSheet.addRow({
        name: tech.name,
        email: tech.email,
        assigned,
        resolved,
        rate,
      });
    });

    // 2. Sheet: Employee Activity
    const empSheet = workbook.addWorksheet('Actividad Empleados');
    empSheet.columns = [
      { header: 'Nombre', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Tickets Abiertos', key: 'opened', width: 20 },
    ];

    const employees = await this.prisma.user.findMany({
      where: { 
        companyId,
        role: { name: { contains: 'Empleado', mode: 'insensitive' } } 
      },
      include: {
        createdTickets: true,
      },
    });

    employees.forEach(emp => {
      empSheet.addRow({
        name: emp.name,
        email: emp.email,
        opened: emp.createdTickets.length,
      });
    });

    // 3. Sheet: Areas Incidents
    const areaSheet = workbook.addWorksheet('Incidencias por Área');
    areaSheet.columns = [
      { header: 'Área', key: 'name', width: 25 },
      { header: 'Total Tickets', key: 'total', width: 20 },
      { header: 'Pendientes', key: 'pending', width: 15 },
      { header: 'Resueltos', key: 'resolved', width: 15 },
    ];

    const areas = await this.prisma.area.findMany({
      where: { companyId },
      include: {
        tickets: true,
      },
    });

    areas.forEach(area => {
      areaSheet.addRow({
        name: area.name,
        total: area.tickets.length,
        pending: area.tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length,
        resolved: area.tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
      });
    });

    // Styling headers
    [techSheet, empSheet, areaSheet].forEach(sheet => {
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + `Reporte_General_${new Date().toISOString().split('T')[0]}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
