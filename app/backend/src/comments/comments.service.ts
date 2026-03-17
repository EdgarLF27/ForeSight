import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async findByTicket(ticketId: string, userCompanyId?: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (userCompanyId && ticket.companyId !== userCompanyId) throw new ForbiddenException('Acceso denegado');

    return this.prisma.comment.findMany({
      where: { ticketId },
      include: {
        user: { select: { id: true, name: true, avatar: true, role: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: { content: string; ticketId: string; userId: string }, userCompanyId?: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: data.ticketId } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (userCompanyId && ticket.companyId !== userCompanyId) throw new ForbiddenException('Acceso denegado');

    const comment = await this.prisma.comment.create({
      data: { content: data.content, ticketId: data.ticketId, userId: data.userId },
      include: { user: { select: { id: true, name: true, avatar: true, role: { select: { name: true } } } } },
    });

    try {
      const isCreator = data.userId === ticket.createdById;
      
      // Notificar al TÉCNICO asignado
      if (isCreator && ticket.assignedToId) {
        await this.notificationsService.create(ticket.assignedToId, {
          title: 'Nuevo comentario del cliente',
          message: `El cliente comentó en: ${ticket.title}`,
          type: 'COMMENT_RECEIVED',
          link: ticket.id // ID para redirección
        });
      } 
      // Notificar al EMPLEADO (creador)
      else if (!isCreator) {
        await this.notificationsService.create(ticket.createdById, {
          title: 'Respuesta técnica recibida',
          message: `Respuesta en tu ticket: ${ticket.title}`,
          type: 'COMMENT_RECEIVED',
          link: ticket.id // ID para redirección
        });
      }
    } catch (error) {
      console.error('Error enviando notificación:', error);
    }

    return comment;
  }

  async delete(id: string, userId: string, userCompanyId?: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id }, include: { ticket: true } });
    if (!comment) throw new NotFoundException('Comentario no encontrado');
    if (userCompanyId && comment.ticket.companyId !== userCompanyId) throw new ForbiddenException('Acceso denegado');
    if (comment.userId !== userId) throw new ForbiddenException('Solo el autor puede eliminar');

    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Eliminado' };
  }
}
