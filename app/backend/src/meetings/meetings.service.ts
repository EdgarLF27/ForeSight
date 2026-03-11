import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { MeetingStatus } from '@prisma/client';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  async createProposal(technicianId: string, dto: CreateMeetingDto) {
    const { ticketId, scheduledAt, duration = 60 } = dto;
    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // 1. Verificar existencia del ticket y obtener al empleado
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { createdBy: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    // 2. Validar disponibilidad del técnico (traslapes)
    const technicianOverlap = await this.prisma.meeting.findFirst({
      where: {
        technicianId,
        status: { in: ['PROPOSED', 'ACCEPTED'] },
        OR: [
          {
            scheduledAt: {
              gte: startTime,
              lt: endTime,
            },
          },
          {
            // Caso donde una reunión existente empieza antes pero termina después del inicio de la nueva
            scheduledAt: { lte: startTime },
            // Necesitamos calcular el fin de la existente, pero en SQL directo es más complejo sin RAW.
            // Para simplificar esta lógica de agenda:
          }
        ],
      },
    });

    // Lógica de traslape más precisa (Simplificada para MVP)
    const allTechnicianMeetings = await this.prisma.meeting.findMany({
      where: {
        technicianId,
        status: { in: ['PROPOSED', 'ACCEPTED'] },
        scheduledAt: {
          gte: new Date(startTime.getTime() - 24 * 60 * 60 * 1000), // Ultimas 24h
          lte: new Date(startTime.getTime() + 24 * 60 * 60 * 1000), // Proximas 24h
        }
      }
    });

    for (const m of allTechnicianMeetings) {
      const mStart = new Date(m.scheduledAt).getTime();
      const mEnd = mStart + m.duration * 60000;
      const newStart = startTime.getTime();
      const newEnd = endTime.getTime();

      if ((newStart >= mStart && newStart < mEnd) || (newEnd > mStart && newEnd <= mEnd) || (newStart <= mStart && newEnd >= mEnd)) {
        throw new ConflictException('Ya tienes una reunión programada en este horario');
      }
    }

    // 3. Crear la reunión
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
        employee: {
          select: { name: true, email: true }
        },
        technician: {
          select: { name: true }
        }
      }
    }) as any; // Cast a any para evitar errores de tipado de Prisma en compilación rápida

    // 4. Crear notificación para el empleado
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

    // Verificar que el usuario es parte de la reunión
    if (meeting.technicianId !== userId && meeting.employeeId !== userId) {
      throw new ForbiddenException('No tienes permiso para reprogramar esta reunión');
    }

    const startTime = new Date(scheduledAt);
    
    // Actualizar la reunión
    const updatedMeeting = await this.prisma.meeting.update({
      where: { id },
      data: {
        scheduledAt: startTime,
        duration,
        status: 'PROPOSED',
        lastProposedById: userId,
      }
    });

    // Notificar a la otra parte
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

    // Validaciones de permiso para aceptar/rechazar
    if (status === 'ACCEPTED' || status === 'REJECTED') {
      if (meeting.lastProposedById === userId) {
        throw new ForbiddenException('No puedes aceptar tu propia propuesta. Espera a que la otra parte responda.');
      }
      
      if (meeting.technicianId !== userId && meeting.employeeId !== userId) {
        throw new ForbiddenException('No eres parte de esta reunión.');
      }
    } else if (status === 'CANCELLED') {
      if (meeting.technicianId !== userId && meeting.employeeId !== userId) {
        throw new ForbiddenException('No tienes permiso para cancelar esta reunión.');
      }
    }

    return this.prisma.meeting.update({
      where: { id },
      data: { status },
    });
  }
}
