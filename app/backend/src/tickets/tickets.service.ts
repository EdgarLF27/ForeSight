import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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

    const updated = await this.prisma.ticket.update({
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

    // REGISTRAR ACTIVIDAD
    await this.prisma.ticketActivity.create({
      data: {
        ticketId,
        userId,
        action: 'ASSIGNED',
        details: 'Ticket reclamado por el técnico',
      },
    });

    return updated;
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

    const updated = await this.prisma.ticket.update({
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

    // REGISTRAR ACTIVIDAD
    await this.prisma.ticketActivity.create({
      data: {
        ticketId,
        userId,
        action: 'UNASSIGNED',
        details: isAdmin ? 'Ticket liberado por un administrador' : 'Ticket liberado por el técnico',
      },
    });

    return updated;
  }

  async findOne(id: string, user: any) {
    const { id: userId, role, companyId: userCompanyId } = user;
    const isAdmin = role?.name === 'Administrador';
    const isTechnician = role?.name === 'Técnico';

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
        activities: {
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
            createdAt: 'desc',
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    // Seguridad de Empresa (Multi-tenant)
    if (userCompanyId && ticket.companyId !== userCompanyId) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }

    // Seguridad de Rol (Solo Empleados)
    if (!isAdmin && !isTechnician) {
      // Si es empleado, debe ser el creador o el asignado
      if (ticket.createdById !== userId && ticket.assignedToId !== userId) {
        throw new ForbiddenException('No tienes permiso para ver este ticket');
      }
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

    // REGISTRAR ACTIVIDAD: CREACIÓN
    await this.prisma.ticketActivity.create({
      data: {
        ticketId: ticket.id,
        userId: data.createdById,
        action: 'CREATED',
        details: 'Ticket creado inicialmente',
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
<<<<<<< HEAD
    user?: any,
=======
    currentUserId?: string, // Añadimos quién hace el cambio
>>>>>>> 278b74513601766d9abb83716e970dfe6464c789
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { area: true, assignedTo: true }
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

<<<<<<< HEAD
    // Si el estado cambió a CANCELLED, registrarlo en los comentarios como evento de sistema
    if (data.status === 'CANCELLED' && user) {
      await this.prisma.comment.create({
        data: {
          content: `🛑 El ticket ha sido CANCELADO por el ${user.role?.name || 'Empleado'}: ${user.name}`,
          ticketId: id,
          userId: user.id,
        }
      });
=======
    // --- REGISTRO DE ACTIVIDADES (HISTORIAL) ---
    if (currentUserId) {
      const activities = [];
      
      const statusMap = { 'OPEN': 'Abierto', 'IN_PROGRESS': 'En progreso', 'RESOLVED': 'Resuelto', 'CLOSED': 'Cerrado' };
      const priorityMap = { 'LOW': 'Baja', 'MEDIUM': 'Media', 'HIGH': 'Alta', 'URGENT': 'Urgente' };

      // Cambio de Estado
      if (data.status && data.status !== ticket.status) {
        activities.push({
          ticketId: id,
          userId: currentUserId,
          action: 'STATUS_CHANGE',
          details: `Estado cambiado de "${statusMap[ticket.status]}" a "${statusMap[data.status]}"`,
        });
      }

      // Cambio de Prioridad
      if (data.priority && data.priority !== ticket.priority) {
        activities.push({
          ticketId: id,
          userId: currentUserId,
          action: 'PRIORITY_CHANGE',
          details: `Prioridad cambiada de "${priorityMap[ticket.priority]}" a "${priorityMap[data.priority]}"`,
        });
      }

      // Cambio de Asignación
      if (data.assignedToId !== undefined && data.assignedToId !== ticket.assignedToId) {
        if (data.assignedToId) {
          activities.push({
            ticketId: id,
            userId: currentUserId,
            action: 'ASSIGNED',
            details: `Ticket asignado a ${updated.assignedTo?.name}`,
          });
        } else {
          activities.push({
            ticketId: id,
            userId: currentUserId,
            action: 'UNASSIGNED',
            details: `Se quitó la asignación del técnico`,
          });
        }
      }

      // Cambio de Área
      if (data.areaId !== undefined && data.areaId !== ticket.areaId) {
        activities.push({
          ticketId: id,
          userId: currentUserId,
          action: 'AREA_CHANGE',
          details: `Área cambiada a "${updated.area?.name}"`,
        });
      }

      if (activities.length > 0) {
        await this.prisma.ticketActivity.createMany({ data: activities });
      }
    }
    // --- FIN REGISTRO DE ACTIVIDADES ---

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
>>>>>>> 278b74513601766d9abb83716e970dfe6464c789
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
