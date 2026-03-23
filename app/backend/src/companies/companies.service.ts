import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        _count: { select: { members: true, tickets: true } },
      },
    });
    if (!company) throw new NotFoundException('Empresa no encontrada');
    return company;
  }

  async update(id: string, userId: string, data: { name?: string; description?: string; information?: string }) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException();
    if (company.ownerId !== userId) throw new ForbiddenException('No tienes permisos');

    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  async updateLogo(id: string, userId: string, logoUrl: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException();
    if (company.ownerId !== userId) throw new ForbiddenException();

    return this.prisma.company.update({
      where: { id },
      data: { logo: logoUrl },
    });
  }

  async findByInviteCode(inviteCode: string) {
    const company = await this.prisma.company.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
      select: { id: true, name: true, description: true, logo: true },
    });
    if (!company) throw new NotFoundException('Código inválido');
    return company;
  }

  async regenerateInviteCode(companyId: string, userId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException();
    if (company.ownerId !== userId) throw new ForbiddenException();

    const newCode = this.generateInviteCode();
    return this.prisma.company.update({
      where: { id: companyId },
      data: { inviteCode: newCode },
    });
  }

  async getStats(companyId: string) {
    const [totalTickets, open, inProgress, resolved, totalMembers] = await Promise.all([
      this.prisma.ticket.count({ where: { companyId } }),
      this.prisma.ticket.count({ where: { companyId, status: 'OPEN' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ where: { companyId, status: { in: ['RESOLVED', 'CLOSED'] } } }),
      this.prisma.user.count({ where: { companyId } }),
    ]);
    return { totalTickets, openTickets: open, inProgressTickets: inProgress, resolvedTickets: resolved, totalMembers };
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  }

  async create(userId: string, data: { name: string }) {
    let inviteCode = this.generateInviteCode();
    
    // Verificar que el código no exista (reintento simple)
    const existing = await this.prisma.company.findUnique({ where: { inviteCode } });
    if (existing) inviteCode = this.generateInviteCode();

    try {
      // 1. Crear la empresa
      const company = await this.prisma.company.create({
        data: {
          name: data.name,
          inviteCode,
          ownerId: userId,
        },
      });

      // 2. Crear área por defecto
      const defaultArea = await this.prisma.area.create({
        data: {
          name: 'General',
          description: 'Área predeterminada',
          companyId: company.id,
        }
      });

      // 3. Buscar el rol de Administrador de forma muy flexible
      const adminRole = await this.prisma.role.findFirst({
        where: { 
          OR: [
            { name: { contains: 'Admin', mode: 'insensitive' } },
            { isSystem: true, name: { contains: 'Administrador', mode: 'insensitive' } }
          ]
        }
      });

      // 4. Actualizar al usuario
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { 
          companyId: company.id,
          areaId: defaultArea.id,
          roleId: adminRole?.id || undefined
        },
        include: {
          company: true,
          area: true,
          role: {
            include: { permissions: true }
          }
        }
      });

      return updatedUser;
    } catch (error) {
      console.error('Error en CompaniesService.create:', error);
      throw error;
    }
  }
}
