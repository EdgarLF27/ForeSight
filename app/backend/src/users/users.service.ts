import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      include: {
        role: { select: { id: true, name: true, isSystem: true } },
        area: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: { select: { id: true, name: true, isSystem: true, permissions: true } },
        area: { select: { id: true, name: true, description: true } },
        company: { select: { id: true, name: true } },
      },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findTechnicians(companyId: string, areaId?: string) {
    return this.prisma.user.findMany({
      where: {
        companyId,
        areaId: areaId || undefined,
        role: { name: 'Técnico' },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        area: { select: { id: true, name: true } },
        _count: {
          select: { assignedTickets: { where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } } },
        },
      },
    });
  }

  async update(id: string, updateDto: UpdateUserDto) {
    if (updateDto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: updateDto.email } });
      if (existing && existing.id !== id) {
        throw new BadRequestException('El correo electrónico ya está en uso');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateDto,
      include: {
        role: { select: { id: true, name: true, isSystem: true, permissions: true } },
        area: { select: { id: true, name: true, description: true } },
        company: { select: { id: true, name: true } },
      },
    });

    this.emitUserUpdate(updated);
    return updated;
  }

  async updateAvatar(id: string, avatarUrl: string) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: { avatar: avatarUrl },
      include: {
        role: { select: { id: true, name: true, isSystem: true } },
        area: { select: { id: true, name: true } },
      },
    });
    this.emitUserUpdate(updated);
    return updated;
  }

  async updatePassword(id: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException();

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('La contraseña actual es incorrecta');

    const hashed = await bcrypt.hash(data.newPassword, 10);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    });
  }

  async updateRole(id: string, roleId: string, companyId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.companyId !== companyId) throw new ForbiddenException();

    const updated = await this.prisma.user.update({
      where: { id },
      data: { roleId },
      include: {
        role: { select: { id: true, name: true, isSystem: true, permissions: true } },
        area: { select: { id: true, name: true, description: true } },
        company: { select: { id: true, name: true } },
      },
    });

    this.emitUserUpdate(updated);
    return updated;
  }

  async updateArea(id: string, areaId: string | null, companyId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.companyId !== companyId) throw new ForbiddenException();

    const updated = await this.prisma.user.update({
      where: { id },
      data: { areaId },
      include: {
        role: { select: { id: true, name: true, isSystem: true, permissions: true } },
        area: { select: { id: true, name: true, description: true } },
        company: { select: { id: true, name: true } },
      },
    });

    this.emitUserUpdate(updated);
    return updated;
  }

  async delete(id: string, companyId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { company: true }
    });

    if (!user || user.companyId !== companyId) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.company?.ownerId === id) {
      throw new ForbiddenException('No se puede eliminar al dueño de la empresa');
    }
    
    await this.prisma.user.delete({
      where: { id },
    });

    // Notificar eliminación
    this.eventsGateway.server.to(`company_${companyId}`).emit('userDeleted', id);

    return { message: 'Usuario eliminado exitosamente' };
  }

  private emitUserUpdate(user: any) {
    if (user.companyId) {
      // Notificar a toda la empresa que este usuario cambió (para las listas de Admin/Team)
      this.eventsGateway.server.to(`company_${user.companyId}`).emit('userUpdated', user);
    }
    // Notificar al usuario específico (para que su perfil/UI se actualice si es él mismo)
    this.eventsGateway.server.to(`user_${user.id}`).emit('profileUpdated', user);
  }
}

