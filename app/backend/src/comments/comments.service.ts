import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async findByTicket(ticketId: string, userCompanyId?: string) {
    // Verify ticket exists and user has access
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (userCompanyId && ticket.companyId !== userCompanyId) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }

    const comments = await this.prisma.comment.findMany({
      where: { ticketId },
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
    });

    return comments;
  }

  async create(data: {
    content: string;
    ticketId: string;
    userId: string;
  }, userCompanyId?: string) {
    // Verify ticket exists and user has access
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: data.ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (userCompanyId && ticket.companyId !== userCompanyId) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: data.content,
        ticketId: data.ticketId,
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return comment;
  }

  async delete(id: string, userId: string, userCompanyId?: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        ticket: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (userCompanyId && comment.ticket.companyId !== userCompanyId) {
      throw new ForbiddenException('No tienes acceso a este comentario');
    }

    // Only comment owner can delete
    if (comment.userId !== userId) {
      throw new ForbiddenException('Solo el autor puede eliminar este comentario');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    return { message: 'Comentario eliminado exitosamente' };
  }
}
