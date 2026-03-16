import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus, TicketPriority } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

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
    user?: any,
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

    // Validación por Rol
    if (user) {
      const isAdmin = user.role === 'EMPRESA' || user.role?.name === 'Administrador';
      const isTechnician = user.role?.name === 'Técnico';
      const isEmployee = user.role === 'EMPLEADO' || user.role?.name === 'Empleado';

      // Si es empleado, solo puede cancelar sus propios tickets
      if (isEmployee) {
        if (ticket.createdById !== user.id) {
          throw new ForbiddenException('Solo puedes modificar tus propios tickets');
        }
        if (data.status && data.status !== 'CANCELLED') {
          throw new ForbiddenException('Los empleados solo pueden cancelar tickets');
        }
        // No permitir cambiar otros campos si no es admin
        if (data.title || data.description || data.priority || data.areaId) {
           throw new ForbiddenException('No tienes permiso para editar estos campos');
        }
      }

      // Si es técnico, no puede cerrar tickets directamente
      if (isTechnician && data.status === 'CLOSED') {
        throw new ForbiddenException('Los técnicos no pueden cerrar tickets; deben marcarlos como resueltos');
      }
    }

    // Validación de transición de estados general
    if (data.status && data.status !== ticket.status) {
      this.validateStatusTransition(ticket.status, data.status);
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

    // Si el estado cambió a CANCELLED, registrarlo en los comentarios como evento de sistema
    if (data.status === 'CANCELLED' && user) {
      await this.prisma.comment.create({
        data: {
          content: `🛑 El ticket ha sido CANCELADO por el ${user.role?.name || 'Empleado'}: ${user.name}`,
          ticketId: id,
          userId: user.id,
        }
      });
    }

    return updated;
  }

  private validateStatusTransition(currentStatus: TicketStatus, newStatus: TicketStatus) {
    const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
      [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED, TicketStatus.OPEN, TicketStatus.CANCELLED],
      [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
      [TicketStatus.CLOSED]: [], // Estado final
      [TicketStatus.CANCELLED]: [], // Estado final
    };

    const allowed = allowedTransitions[currentStatus];
    
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transición de estado inválida: no se puede pasar de ${currentStatus} a ${newStatus}`
      );
    }
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
