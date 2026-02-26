import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            tickets: true,
          },
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
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Código de invitación inválido');
    }

    return company;
  }

  async regenerateInviteCode(companyId: string, userId: string) {
    // Verify user is the owner
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    if (company.ownerId !== userId) {
      throw new ForbiddenException('Solo el dueño puede regenerar el código');
    }

    const newCode = this.generateInviteCode();

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: { inviteCode: newCode },
    });

    return { inviteCode: updated.inviteCode };
  }

  async getStats(companyId: string) {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      totalMembers,
    ] = await Promise.all([
      this.prisma.ticket.count({ where: { companyId } }),
      this.prisma.ticket.count({ where: { companyId, status: 'OPEN' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ 
        where: { 
          companyId, 
          OR: [{ status: 'RESOLVED' }, { status: 'CLOSED' }] 
        } 
      }),
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
