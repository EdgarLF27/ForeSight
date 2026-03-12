import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { MeetingStatus } from '@prisma/client';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  private async checkOverlap(technicianId: string, startTime: Date, endTime: Date, excludeMeetingId?: string) {
    const allMeetings = await this.prisma.meeting.findMany({
      where: {
        technicianId,
        status: { in: ['PROPOSED', 'ACCEPTED'] },
        id: excludeMeetingId ? { not: excludeMeetingId } : undefined,
        scheduledAt: {
          gte: new Date(startTime.getTime() - 24 * 60 * 60 * 1000), // Ventana de 24h para optimizar
          lte: new Date(startTime.getTime() + 24 * 60 * 60 * 1000),
        }
      }
    });

    for (const m of allMeetings) {
      const mStart = new Date(m.scheduledAt).getTime();
      const mEnd = mStart + m.duration * 60000;
      const newStart = startTime.getTime();
      const newEnd = endTime.getTime();

      if ((newStart >= mStart && newStart < mEnd) || (newEnd > mStart && newEnd <= mEnd) || (newStart <= mStart && newEnd >= mEnd)) {
        throw new ConflictException(`Conflicto de horario: Ya tienes la reunión "${m.title}" programada de ${new Date(mStart).toLocaleTimeString()} a ${new Date(mEnd).toLocaleTimeString()}`);
      }
    }
  }

  async createProposal(technicianId: string, dto: CreateMeetingDto) {
    const { ticketId, scheduledAt, duration = 60 } = dto;
    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // 1. Verificar ticket
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    // 2. Validar traslapes
    await this.checkOverlap(technicianId, startTime, endTime);

    // 3. Crear reunión
    const meeting = await this.prisma.meeting.create({
      data: {
        title: dto.title,
        description: dto.description,
        scheduledAt: startTime,
        duration,
        type: dto.type,
        status: 'PROPOSED',
        ticketId,
        technicianId,
        employeeId: ticket.createdById,
        lastProposedById: technicianId,
      },
      include: {
        employee: { select: { name: true, email: true } },
        technician: { select: { name: true } }
      }
    }) as any;

    // 4. Notificar
    await this.prisma.notification.create({
      data: {
        userId: ticket.createdById,
        title: 'Nueva propuesta de reunión',
        message: `El técnico ${meeting.technician.name} ha propuesto una reunión para el ticket: ${ticket.title}`,
        type: 'MEETING_PROPOSAL',
      }
    });

    return meeting;
  }

  async repropose(id: string, userId: string, scheduledAt: string, duration: number = 60) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: { ticket: true, technician: true, employee: true }
    }) as any;

    if (!meeting) throw new NotFoundException('Reunión no encontrada');

    if (meeting.technicianId !== userId && meeting.employeeId !== userId) {
      throw new ForbiddenException('No tienes permiso para reprogramar esta reunión');
    }

    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // PASO DE MAESTRO: Validar traslapes también al reprogramar, excluyendo la reunión actual
    // Si el usuario es el técnico, validamos su agenda
    if (userId === meeting.technicianId) {
        await this.checkOverlap(userId, startTime, endTime, id);
    }

    const updatedMeeting = await this.prisma.meeting.update({
      where: { id },
      data: {
        scheduledAt: startTime,
        duration,
        status: 'PROPOSED',
        lastProposedById: userId,
      }
    });

    const otherUserId = userId === meeting.technicianId ? meeting.employeeId : meeting.technicianId;
    const proposerName = userId === meeting.technicianId ? meeting.technician.name : meeting.employee.name;

    await this.prisma.notification.create({
      data: {
        userId: otherUserId,
        title: 'Nueva propuesta de horario',
        message: `${proposerName} ha sugerido un nuevo horario para la reunión del ticket: ${meeting.ticket.title}`,
        type: 'MEETING_REPROPOSAL',
      }
    });

    return updatedMeeting;
  }

  async findByTicket(ticketId: string) {
    return this.prisma.meeting.findMany({
      where: { ticketId },
      include: {
        technician: { select: { name: true, avatar: true } },
        employee: { select: { name: true, avatar: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.meeting.findMany({
      where: {
        OR: [
          { technicianId: userId },
          { employeeId: userId },
        ]
      },
      include: {
        ticket: { select: { title: true } },
        technician: { select: { name: true } },
        employee: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async updateStatus(id: string, userId: string, status: MeetingStatus) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
    }) as any;

    if (!meeting) throw new NotFoundException('Reunión no encontrada');

    if (status === 'ACCEPTED' || status === 'REJECTED') {
      if (meeting.lastProposedById === userId) {
        throw new ForbiddenException('No puedes aceptar tu propia propuesta. Espera a que la otra parte responda.');
      }
    }

    return this.prisma.meeting.update({
      where: { id },
      data: { status },
    });
  }

  async findAgenda(userId: string) {
    return this.prisma.meeting.findMany({
      where: {
        OR: [
          { technicianId: userId },
          { employeeId: userId },
        ],
        status: 'ACCEPTED',
        scheduledAt: {
          gte: new Date(), // Solo futuras o actuales
        },
      },
      include: {
        ticket: { select: { title: true } },
        technician: { select: { name: true, avatar: true } },
        employee: { select: { name: true, avatar: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
