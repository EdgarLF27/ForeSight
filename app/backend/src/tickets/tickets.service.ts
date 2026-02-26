import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus, TicketPriority } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    description: string;
    priority: TicketPriority;
    category?: string;
    companyId: string;
    createdById: string;
  }) {
    return this.prisma.ticket.create({
      data: {
        ...data,
        category: data.category || 'General',
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async findAll(companyId: string, userId?: string) {
    const where: any = { companyId };
    if (userId) {
      where.OR = [{ createdById: userId }, { assignedToId: userId }];
    }

    return this.prisma.ticket.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    return ticket;
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: string;
    assignedToId?: string;
  }) {
    return this.prisma.ticket.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.ticket.delete({ where: { id } });
  }

  async getStats(companyId: string) {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      this.prisma.ticket.count({ where: { companyId } }),
      this.prisma.ticket.count({ where: { companyId, status: 'OPEN' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'RESOLVED' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'CLOSED' } }),
    ]);

    return { total, open, inProgress, resolved, closed };
  }
}
