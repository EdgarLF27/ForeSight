import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { content: string; ticketId: string; userId: string }) {
    return this.prisma.comment.create({
      data,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async findByTicket(ticketId: string) {
    return this.prisma.comment.findMany({
      where: { ticketId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
