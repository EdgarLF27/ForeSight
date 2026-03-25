import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class AreasService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async findAll(companyId: string) {
    return this.prisma.area.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { tickets: true, users: true }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const area = await this.prisma.area.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tickets: true, users: true }
        }
      }
    });

    if (!area || area.companyId !== companyId) {
      throw new NotFoundException('Área no encontrada');
    }

    return area;
  }

  async create(companyId: string, dto: CreateAreaDto) {
    // Validar que no exista un área con el mismo nombre en la empresa (Insensible a mayúsculas)
    const existingArea = await this.prisma.area.findFirst({
      where: {
        name: { equals: dto.name, mode: 'insensitive' },
        companyId,
      },
    });

    if (existingArea) {
      throw new ForbiddenException('Ya existe un área con este nombre en tu empresa');
    }

    const area = await this.prisma.area.create({
      data: {
        ...dto,
        companyId,
      },
    });

    this.eventsGateway.server.to(`company_${companyId}`).emit('areaCreated', area);
    return area;
  }

  async update(id: string, companyId: string, dto: CreateAreaDto) {
    await this.findOne(id, companyId);

    // Validar que el nuevo nombre no choque con otro área existente
    const duplicateArea = await this.prisma.area.findFirst({
      where: {
        id: { not: id },
        name: { equals: dto.name, mode: 'insensitive' },
        companyId,
      },
    });

    if (duplicateArea) {
      throw new ForbiddenException('Ya existe otra área con este nombre');
    }

    const updated = await this.prisma.area.update({
      where: { id },
      data: dto,
    });

    this.eventsGateway.server.to(`company_${companyId}`).emit('areaUpdated', updated);
    return updated;
  }

  async delete(id: string, companyId: string) {
    const area = await this.findOne(id, companyId);

    // No permitir borrar si tiene tickets o usuarios vinculados
    const hasTickets = await this.prisma.ticket.count({ where: { areaId: id } });
    const hasUsers = await this.prisma.user.count({ where: { areaId: id } });

    if (hasTickets > 0 || hasUsers > 0) {
      throw new ForbiddenException(
        `No se puede eliminar el área porque tiene ${hasTickets} tickets y ${hasUsers} usuarios asociados`
      );
    }

    await this.prisma.area.delete({
      where: { id },
    });

    this.eventsGateway.server.to(`company_${companyId}`).emit('areaDeleted', id);
    return { message: 'Área eliminada exitosamente' };
  }
}
