import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(userId: string, data: { title: string; message: string; type: string; link?: string }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        ...data,
      },
    });

    // Enviar la notificación en tiempo real solo al usuario correspondiente
    this.eventsGateway.server.to(`user_${userId}`).emit('newNotification', notification);

    return notification;
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async deleteAll(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }
}
