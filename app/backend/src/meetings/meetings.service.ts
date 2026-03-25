import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { MeetingStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class MeetingsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) {}

  private async checkOverlap(technicianId: string, startTime: Date, endTime: Date, excludeMeetingId?: string) {
    const allMeetings = await this.prisma.meeting.findMany({
      where: {
        technicianId,
        status: { in: ['PROPOSED', 'ACCEPTED'] },
        id: excludeMeetingId ? { not: excludeMeetingId } : undefined,
        scheduledAt: {
          gte: new Date(startTime.getTime() - 24 * 60 * 60 * 1000),
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

  private generateMeetingLink(ticketId: string): string {
    const roomName = `ForeSight-${ticketId.replace(/-/g, '').slice(0, 10)}`;
    return `https://meet.jit.si/${roomName}`;
  }

  async createProposal(technicianId: string, dto: CreateMeetingDto) {
    const { ticketId, scheduledAt, duration = 60 } = dto;
    const startTime = new Date(scheduledAt);
    
    if (startTime < new Date()) {
      throw new BadRequestException('No puedes programar una reunión en una fecha pasada.');
    }

    const endTime = new Date(startTime.getTime() + duration * 60000);

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    await this.checkOverlap(technicianId, startTime, endTime);

    const meeting = await this.prisma.meeting.create({
      data: {
        title: dto.title,
        description: dto.description,
        scheduledAt: startTime,
        duration,
        type: dto.type,
        meetingLink: dto.type === 'VIRTUAL' ? this.generateMeetingLink(ticketId) : null,
        status: 'PROPOSED',
        ticketId,
        technicianId,
        employeeId: ticket.createdById,
        lastProposedById: technicianId,
      },
      include: {
        employee: { select: { id: true, name: true, email: true, avatar: true } },
        technician: { select: { id: true, name: true, avatar: true } },
        ticket: { select: { id: true, title: true } }
      }
    }) as any;

    await this.notificationsService.create(ticket.createdById, {
      title: 'Nueva propuesta de reunión',
      message: `El técnico ${meeting.technician.name} ha propuesto una reunión para el ticket: ${ticket.title}`,
      type: 'MEETING_PROPOSAL',
      link: ticketId
    });

    this.emitMeetingUpdate(meeting);
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
    if (startTime < new Date()) {
      throw new BadRequestException('La nueva fecha no puede ser en el pasado.');
    }

    const endTime = new Date(startTime.getTime() + duration * 60000);

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
      },
      include: {
        employee: { select: { id: true, name: true, email: true, avatar: true } },
        technician: { select: { id: true, name: true, avatar: true } },
        ticket: { select: { id: true, title: true } }
      }
    });

    const otherUserId = userId === meeting.technicianId ? meeting.employeeId : meeting.technicianId;
    const proposerName = userId === meeting.technicianId ? meeting.technician.name : meeting.employee.name;

    await this.notificationsService.create(otherUserId, {
      title: 'Nueva propuesta de horario',
      message: `${proposerName} ha sugerido un nuevo horario para la reunión del ticket: ${meeting.ticket.title}`,
      type: 'MEETING_REPROPOSAL',
      link: meeting.ticketId
    });

    this.emitMeetingUpdate(updatedMeeting);
    return updatedMeeting;
  }

  async findByTicket(ticketId: string) {
    return this.prisma.meeting.findMany({
      where: { ticketId },
      include: {
        technician: { select: { id: true, name: true, avatar: true } },
        employee: { select: { id: true, name: true, avatar: true } },
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
        ticket: { select: { id: true, title: true } },
        technician: { select: { id: true, name: true } },
        employee: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async updateStatus(id: string, userId: string, status: MeetingStatus) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: { ticket: true, technician: true, employee: true }
    }) as any;

    if (!meeting) throw new NotFoundException('Reunión no encontrada');

    if (status === 'ACCEPTED' || status === 'REJECTED') {
      if (meeting.lastProposedById === userId) {
        throw new ForbiddenException('No puedes aceptar tu propia propuesta.');
      }
    }

    const updated = await this.prisma.meeting.update({
      where: { id },
      data: { status },
      include: {
        employee: { select: { id: true, name: true, email: true, avatar: true } },
        technician: { select: { id: true, name: true, avatar: true } },
        ticket: { select: { id: true, title: true } }
      }
    });

    const otherUserId = userId === meeting.technicianId ? meeting.employeeId : meeting.technicianId;
    const responderName = userId === meeting.technicianId ? meeting.technician.name : meeting.employee.name;
    const statusText = status === 'ACCEPTED' ? 'aceptado' : 'rechazado';

    await this.notificationsService.create(otherUserId, {
      title: `Reunión ${statusText}`,
      message: `${responderName} ha ${statusText} la reunión para el ticket: ${meeting.ticket.title}`,
      type: 'MEETING_STATUS_UPDATE',
      link: meeting.ticketId
    });

    this.emitMeetingUpdate(updated);
    return updated;
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
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Mostrar desde el inicio del día actual
        },
      },
      include: {
        ticket: { select: { id: true, title: true } },
        technician: { select: { id: true, name: true, avatar: true } },
        employee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findCompanyAgenda(companyId: string, technicianId?: string) {
    return this.prisma.meeting.findMany({
      where: {
        ticket: { companyId },
        technicianId: technicianId || undefined,
        status: 'ACCEPTED',
        scheduledAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Desde hoy
        },
      },
      include: {
        ticket: { select: { id: true, title: true } },
        technician: { select: { id: true, name: true, avatar: true } },
        employee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  private emitMeetingUpdate(meeting: any) {
    // Notificar a ambos participantes en sus salas privadas
    this.eventsGateway.server.to(`user_${meeting.technicianId}`).emit('meetingUpdated', meeting);
    this.eventsGateway.server.to(`user_${meeting.employeeId}`).emit('meetingUpdated', meeting);
    
    // Si la reunión está aceptada, notificar también a la empresa (para dashboards de supervisión si existen)
    // Opcional: Esto depende de si el Admin ve la agenda global
    // this.eventsGateway.server.to(`company_${companyId}`).emit('meetingUpdated', meeting);
  }
}

