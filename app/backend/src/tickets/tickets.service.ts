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
    const { id: userId, role } = user;
    const isAdmin = role?.name === 'Administrador' || user.role === 'EMPRESA';
    const isTechnician = role?.name === 'Técnico';

    const where: any = { companyId };
    if (isAdmin) {
    } else if (isTechnician) {
      where.OR = [{ assignedToId: userId }, { assignedToId: null, status: 'OPEN' }];
    } else {
      where.OR = [{ createdById: userId }, { assignedToId: userId }];
    }

    return this.prisma.ticket.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        area: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async claim(ticketId: string, userId: string, companyId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (ticket.companyId !== companyId) throw new ForbiddenException('No tienes acceso');
    if (ticket.assignedToId) throw new ForbiddenException('Ya reclamado');

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedToId: userId, status: 'IN_PROGRESS' },
      include: { assignedTo: { select: { id: true, name: true, avatar: true } } },
    });

    await this.prisma.ticketActivity.create({
      data: { ticketId, userId, action: 'ASSIGNED', details: 'Ticket reclamado por el técnico' },
    });

    try {
      await this.notificationsService.create(ticket.createdById, {
        title: 'Técnico asignado',
        message: `El técnico ${updated.assignedTo?.name} ha tomado tu ticket: ${ticket.title}`,
        type: 'TICKET_ASSIGNED',
        link: ticket.id
      });
    } catch (e) {}

    return updated;
  }

  async unclaim(ticketId: string, userId: string, companyId: string, user: any) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    
    const isAdmin = user.role?.name === 'Administrador';
    if (ticket.assignedToId !== userId && !isAdmin) throw new ForbiddenException('No puedes liberar este ticket');

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedToId: null, status: 'OPEN' },
    });

    await this.prisma.ticketActivity.create({
      data: { ticketId, userId, action: 'UNASSIGNED', details: isAdmin ? 'Liberado por admin' : 'Liberado por técnico' },
    });

    return updated;
  }

  async findOne(id: string, user: any) {
    const { id: userId, role, companyId: userCompanyId } = user;
    const isAdmin = role?.name === 'Administrador' || user.role === 'EMPRESA';
    const isTechnician = role?.name === 'Técnico';

    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        area: { select: { id: true, name: true } },
        company: { select: { id: true, name: true, ownerId: true } }, // CORREGIDO: Incluimos ownerId
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true, role: { select: { name: true } } } } },
          orderBy: { createdAt: 'asc' },
        },
        activities: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (userCompanyId && ticket.companyId !== userCompanyId) throw new ForbiddenException('Acceso denegado');
    
    const isOwner = user.id === ticket.company.ownerId;
    if (!isAdmin && !isTechnician && !isOwner && ticket.createdById !== userId && ticket.assignedToId !== userId) {
      throw new ForbiddenException('Sin permiso para ver este ticket');
    }

    return ticket;
  }

  async create(data: any) {
    // EVITAR DUPLICADOS: Buscar si existe un ticket idéntico creado hace menos de 1 minuto
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const existingDuplicate = await this.prisma.ticket.findFirst({
      where: {
        title: data.title,
        description: data.description,
        createdById: data.createdById,
        createdAt: { gte: oneMinuteAgo },
      }
    });

    if (existingDuplicate) {
      throw new BadRequestException('Ya has enviado un ticket idéntico recientemente. Por favor, espera un momento.');
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category || 'General',
        companyId: data.companyId,
        createdById: data.createdById,
        areaId: data.areaId || null,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        area: { select: { id: true, name: true } },
      },
    });

    await this.prisma.ticketActivity.create({
      data: { ticketId: ticket.id, userId: data.createdById, action: 'CREATED', details: 'Ticket creado' },
    });

    return ticket;
  }

  async update(id: string, data: any, companyId: string, currentUserId: string, user?: any) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { area: true, assignedTo: true, company: true }
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (companyId && ticket.companyId !== companyId) throw new ForbiddenException('Acceso denegado');

    if (user) {
      const isAdmin = user.role === 'EMPRESA' || user.role?.name === 'Administrador' || user.id === ticket.company.ownerId;
      const isTechnician = user.role?.name === 'Técnico';
      const isEmployee = user.role === 'EMPLEADO' || user.role?.name === 'Empleado';

      if (isEmployee && !isAdmin) {
        if (ticket.createdById !== user.id) throw new ForbiddenException('Solo tus tickets');
        if (data.status && data.status !== 'CANCELLED') throw new ForbiddenException('Solo puedes cancelar');
      }
    }

    if (data.status && data.status !== ticket.status) {
      this.validateStatusTransition(ticket.status, data.status);
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data,
      include: { 
        area: { select: { name: true } }, 
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } }
      },
    });

    try {
      if (data.status && data.status !== ticket.status) {
        await this.prisma.ticketActivity.create({
          data: { ticketId: id, userId: currentUserId, action: 'STATUS_CHANGE', details: `De ${ticket.status} a ${data.status}` }
        });

        if (currentUserId !== ticket.createdById) {
          const statusLabels = { 'OPEN': 'Abierto', 'IN_PROGRESS': 'en progreso', 'RESOLVED': 'resuelto', 'CLOSED': 'cerrado', 'CANCELLED': 'cancelado' };
          await this.notificationsService.create(ticket.createdById, {
            title: 'Actualización de estado',
            message: `Tu ticket "${ticket.title}" ahora está ${statusLabels[data.status] || data.status}.`,
            type: 'STATUS_CHANGED',
            link: ticket.id
          });
        }
      }

      if (data.assignedToId && data.assignedToId !== ticket.assignedToId) {
        await this.prisma.ticketActivity.create({
          data: { ticketId: id, userId: currentUserId, action: 'ASSIGNED', details: `Asignado a ${updated.assignedTo?.name}` }
        });

        await this.notificationsService.create(data.assignedToId, {
          title: 'Nuevo ticket asignado',
          message: `Se te ha asignado el ticket: ${updated.title}`,
          type: 'TICKET_ASSIGNED',
          link: ticket.id
        });
      }
    } catch (e) {
      console.error('Error en disparadores de notificación:', e);
    }

    return updated;
  }

  private validateStatusTransition(current: TicketStatus, next: TicketStatus) {
    const allowed: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
      [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED, TicketStatus.OPEN, TicketStatus.CANCELLED],
      [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
      [TicketStatus.CLOSED]: [],
      [TicketStatus.CANCELLED]: [],
    };
    if (!allowed[current].includes(next)) throw new BadRequestException(`Transición no permitida`);
  }

  async delete(id: string, companyId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket || ticket.companyId !== companyId) throw new NotFoundException();
    await this.prisma.ticket.delete({ where: { id } });
    return { message: 'Eliminado' };
  }

  async getStats(companyId: string) {
    const [total, open, inProgress, resolved, closed, cancelled] = await Promise.all([
      this.prisma.ticket.count({ where: { companyId } }),
      this.prisma.ticket.count({ where: { companyId, status: 'OPEN' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'RESOLVED' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'CLOSED' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'CANCELLED' } }),
    ]);
    return { total, open, inProgress, resolved, closed, cancelled };
  }
}
