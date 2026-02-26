import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        members: {
          select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return company;
  }

  async findByInviteCode(inviteCode: string) {
    const company = await this.prisma.company.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    });

    if (!company) {
      throw new NotFoundException('Código de invitación no válido');
    }

    return company;
  }

  async update(id: string, data: any) {
    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  async regenerateInviteCode(id: string, userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    if (company.ownerId !== userId) {
      throw new UnauthorizedException('No tienes permiso para realizar esta acción');
    }

    const inviteCode = this.generateInviteCode();

    return this.prisma.company.update({
      where: { id },
      data: { inviteCode },
    });
  }

  async getStats(companyId: string) {
    const [totalTickets, openTickets, inProgressTickets, resolvedTickets, totalMembers] = await Promise.all([
      this.prisma.ticket.count({ where: { companyId } }),
      this.prisma.ticket.count({ where: { companyId, status: 'OPEN' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'RESOLVED' } }),
      this.prisma.user.count({ where: { companyId } }),
    ]);

    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      totalMembers,
    };
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
