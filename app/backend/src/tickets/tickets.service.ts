import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async findAll(companyId: string, user: any) {
    const { id: userId, role, permissions } = user;
    const isAdmin = role?.name === 'Administrador';
    const isTechnician = role?.name === 'Técnico';

    const where: any = { companyId };
    
    // Lógica de visibilidad
    if (isAdmin) {
      // Admin ve todo en su empresa (no hay filtros adicionales)
    } else if (isTechnician) {
      // Técnico ve: 1. Lo que tiene asignado, 2. Tickets abiertos sin asignar
      where.OR = [
        { assignedToId: userId },
        { 
          assignedToId: null,
          status: 'OPEN'
        }
      ];
    } else {
      // Empleado (u otros) solo ven lo que crearon o se les asignó
      where.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    const tickets = await this.prisma.ticket.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        area: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tickets;
  }

  async claim(ticketId: string, userId: string, companyId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (ticket.companyId !== companyId) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }

    if (ticket.assignedToId) {
      throw new ForbiddenException('Este ticket ya ha sido reclamado');
    }

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedToId: userId,
        status: 'IN_PROGRESS',
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async unclaim(ticketId: string, userId: string, companyId: string, user: any) {
    const ticketData = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticketData) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (ticketData.companyId !== companyId) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }

    const isAdmin = user.role?.name === 'Administrador';
    
    // Solo puede des-reclamar si es el asignado o es administrador
    if (ticketData.assignedToId !== userId && !isAdmin) {
      throw new ForbiddenException('No puedes liberar un ticket que no tienes asignado');
    }

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedToId: null,
        status: 'OPEN',
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userCompanyId?: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        area: {
          select: {
            id: true,
            name: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (userCompanyId && ticket.companyId !== userCompanyId) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }

    return ticket;
  }

  async create(data: {
    title: string;
    description: string;
    priority: any;
    category?: string;
    companyId: string;
    createdById: string;
    assignedToId?: string;
    areaId?: string;
  }) {
    // Validar prioridad para Prisma Enum
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const priority = validPriorities.includes(data.priority) ? data.priority : 'MEDIUM';

    // Limpiar areaId si viene vacío
    const areaId = (data.areaId && data.areaId.trim() !== '') ? data.areaId : null;

    const ticket = await this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: priority,
        category: data.category || 'General',
        companyId: data.companyId,
        createdById: data.createdById,
        assignedToId: data.assignedToId,
        areaId: areaId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        area: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return ticket;
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: TicketStatus;
      priority?: TicketPriority;
      category?: string;
      assignedToId?: string | null;
      areaId?: string;
    },
    userCompanyId?: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (userCompanyId && ticket.companyId !== userCompanyId) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        area: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // TRIGGER DE NOTIFICACIÓN
    if (data.assignedToId && data.assignedToId !== ticket.assignedToId) {
      try {
        // Notificar al técnico
        await this.notificationsService.create(data.assignedToId, {
          title: 'Nuevo ticket asignado',
          message: `Se te ha asignado el ticket: ${updated.title}`,
          type: 'TICKET_ASSIGNED',
        });

        // Notificar al creador (empleado)
        await this.notificationsService.create(updated.createdById, {
          title: 'Técnico asignado a tu ticket',
          message: `El técnico ${updated.assignedTo?.name} ha sido asignado a tu ticket: ${updated.title}`,
          type: 'TICKET_ASSIGNED_CREATOR',
        });
      } catch (error) {
        console.error('Error enviando notificaciones de asignación:', error);
      }
    }

    return updated;
  }

  async delete(id: string, userCompanyId?: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (userCompanyId && ticket.companyId !== userCompanyId) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }

    await this.prisma.ticket.delete({
      where: { id },
    });

    return { message: 'Ticket eliminado exitosamente' };
  }

  async getStats(companyId: string) {
    const [
      total,
      open,
      inProgress,
      resolved,
      closed,
    ] = await Promise.all([
      this.prisma.ticket.count({ where: { companyId } }),
      this.prisma.ticket.count({ where: { companyId, status: 'OPEN' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'RESOLVED' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'CLOSED' } }),
    ]);

    return { total, open, inProgress, resolved, closed };
  }
}
