import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, data: { name: string; description?: string; permissionIds: string[] }) {
    const existing = await this.prisma.role.findFirst({
      where: { name: data.name, companyId },
    });

    if (existing) {
      throw new ConflictException('Ya existe un rol con ese nombre en tu empresa');
    }

    return this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        companyId,
        permissions: {
          connect: data.permissionIds.map(id => ({ id })),
        },
      },
      include: { permissions: true },
    });
  }

  async findAll(companyId: string) {
    const roles = await this.prisma.role.findMany({
      where: {
        OR: [
          { companyId },
          { isSystem: true },
        ],
      },
      include: { permissions: true },
    });

    // Obtener los conteos de usuarios por rol FILTRADOS por empresa
    const userCounts = await this.prisma.user.groupBy({
      by: ['roleId'],
      where: { companyId },
      _count: { id: true },
    });

    // Mapear los conteos a sus respectivos roles
    return roles.map(role => {
      const countData = userCounts.find(c => c.roleId === role.id);
      return {
        ...role,
        _count: {
          users: countData ? countData._count.id : 0
        }
      };
    });
  }

  async findOne(id: string, companyId: string) {
    const role = await this.prisma.role.findFirst({
      where: { 
        id,
        OR: [
          { companyId },
          { isSystem: true },
        ],
      },
      include: { permissions: true },
    });

    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async update(id: string, companyId: string, data: { name?: string; description?: string; permissionIds?: string[] }) {
    const role = await this.findOne(id, companyId);
    
    if (role.isSystem) {
      throw new ConflictException('No se pueden editar roles del sistema');
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds ? {
          set: data.permissionIds.map(pid => ({ id: pid })),
        } : undefined,
      },
      include: { permissions: true },
    });
  }

  async remove(id: string, companyId: string) {
    const role = await this.findOne(id, companyId);

    if (role.isSystem) {
      throw new ConflictException('No se pueden eliminar roles del sistema');
    }

    // Verificar si hay usuarios asignados
    const usersCount = await this.prisma.user.count({ where: { roleId: id } });
    if (usersCount > 0) {
      throw new ConflictException('No se puede eliminar un rol que tiene usuarios asignados');
    }

    return this.prisma.role.delete({ where: { id } });
  }
}
