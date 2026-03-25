import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async create(companyId: string, data: { name: string; description?: string; permissionIds: string[] }) {
    const existing = await this.prisma.role.findFirst({
      where: { name: data.name, companyId },
    });

    if (existing) {
      throw new ConflictException('Ya existe un rol con ese nombre en tu empresa');
    }

    const role = await this.prisma.role.create({
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

    this.eventsGateway.server.to(`company_${companyId}`).emit('roleCreated', role);
    return role;
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

    console.log(`RolesService: Se encontraron ${roles.length} roles para companyId: ${companyId}`);

    // Si el usuario no está en una empresa, el groupBy fallará. Lo protegemos.
    if (!companyId) {
      return roles.map(role => ({ ...role, _count: { users: 0 } }));
    }

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

    const updated = await this.prisma.role.update({
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

    this.eventsGateway.server.to(`company_${companyId}`).emit('roleUpdated', updated);
    return updated;
  }

  async remove(id: string, companyId: string) {
    const role = await this.findOne(id, companyId);

    if (role.isSystem) {
      throw new ConflictException('No se pueden eliminar roles del sistema');
    }

    const usersCount = await this.prisma.user.count({ where: { roleId: id } });
    if (usersCount > 0) {
      throw new ConflictException('No se puede eliminar un rol que tiene usuarios asignados');
    }

    await this.prisma.role.delete({ where: { id } });
    this.eventsGateway.server.to(`company_${companyId}`).emit('roleDeleted', id);
    return { success: true };
  }
}
