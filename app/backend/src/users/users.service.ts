import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.user.findMany({
      where: companyId ? { companyId } : {},
      include: {
        role: { select: { name: true } },
        area: { select: { name: true } },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: { select: { id: true, name: true, isSystem: true } },
        area: { select: { id: true, name: true } },
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
        _count: {
          select: { assignedTickets: { where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } } },
        },
      },
    });
  }

  async update(id: string, updateDto: UpdateUserDto) {
    // Si se está intentando cambiar el email, verificar que no esté en uso
    if (updateDto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: updateDto.email } });
      if (existing && existing.id !== id) {
        throw new BadRequestException('El correo electrónico ya está en uso');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateDto,
      include: {
        role: { select: { name: true } },
        area: { select: { name: true } },
      },
    });
  }

  async updateAvatar(id: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: { avatar: avatarUrl },
    });
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
    // Verificar que el usuario pertenezca a la empresa
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.companyId !== companyId) throw new ForbiddenException();

    return this.prisma.user.update({
      where: { id },
      data: { roleId },
    });
  }

  async updateArea(id: string, areaId: string | null, companyId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.companyId !== companyId) throw new ForbiddenException();

    return this.prisma.user.update({
      where: { id },
      data: { areaId },
    });
  }

  async delete(id: string, companyId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { company: true }
    });

    if (!user || user.companyId !== companyId) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // No permitir eliminar al dueño
    if (user.company?.ownerId === id) {
      throw new ForbiddenException('No se puede eliminar al dueño de la empresa');
    }

    // ELIMINAR O DESVINCULAR DEPENDENCIAS (Notificaciones, Actividades, etc. ya tienen Cascade en schema si corresponde)
    // Pero los tickets necesitan manejo o Prisma fallará por integridad referencial si no está en Cascade
    
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuario eliminado exitosamente' };
  }
}
