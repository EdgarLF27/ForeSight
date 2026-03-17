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
}
