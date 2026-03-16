import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    const where = companyId ? { companyId } : {};
    
    const users = await this.prisma.user.findMany({
      where,
      include: { role: true, area: true },
    });

    return users.map(({ password, ...u }) => u);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { company: true, role: true, area: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...result } = user;
    return result;
  }

  async findByCompany(companyId: string) {
    const users = await this.prisma.user.findMany({
      where: { companyId },
      include: { role: true, area: true },
    });

    return users.map(({ password, ...u }) => u);
  }

  async findTechnicians(companyId: string, areaId?: string) {
    return this.prisma.user.findMany({
      where: {
        companyId,
        isActive: true,
        role: { name: 'Técnico' },
        ...(areaId ? { areaId } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        area: {
          select: { name: true }
        },
        _count: {
          select: {
            assignedTickets: {
              where: { status: { in: ['OPEN', 'IN_PROGRESS'] } }
            }
          }
        }
      },
      orderBy: {
        assignedTickets: { _count: 'asc' } // Ordenar por carga de trabajo (menos ocupados primero)
      }
    });
  }

  async update(id: string, data: { name?: string; email?: string; avatar?: string; isActive?: boolean }) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { company: true, role: true, area: true },
    });

    const { password, ...result } = user;
    return result;
  }

  async updateArea(id: string, areaId: string | null, companyId: string) {
    // 1. Verificar que el usuario a editar existe y PERTENECE A LA EMPRESA
    const userToUpdate = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!userToUpdate) throw new NotFoundException('Usuario no encontrado');
    
    // BLOQUEO MULTI-EMPRESA: No puedes editar empleados de otros
    if (userToUpdate.companyId !== companyId) {
      throw new ForbiddenException('No tienes permiso para editar este usuario');
    }

    // 2. Si se asigna un área, verificar que existe y es de la empresa
    if (areaId) {
      const area = await this.prisma.area.findFirst({
        where: { id: areaId, companyId }
      });

      if (!area) {
        throw new NotFoundException('El área especificada no es válida para tu organización');
      }
    }

    // 3. Ejecutar la actualización
    const user = await this.prisma.user.update({
      where: { id },
      data: { areaId },
      include: { role: true, area: true }
    });

    const { password, ...result } = user;
    return result;
  }

  async updateRole(id: string, roleId: string, companyId: string) {
    // 1. Verificar pertenencia a la empresa
    const userToUpdate = await this.prisma.user.findUnique({ where: { id } });
    if (!userToUpdate || userToUpdate.companyId !== companyId) {
      throw new ForbiddenException('No puedes cambiar el rol de este usuario');
    }

    // 2. Verificar que el rol existe y es accesible
    const role = await this.prisma.role.findFirst({
      where: {
        id: roleId,
        OR: [{ companyId }, { isSystem: true }]
      }
    });

    if (!role) throw new NotFoundException('Rol no válido');

    const user = await this.prisma.user.update({
      where: { id },
      data: { roleId },
      include: { role: true }
    });

    const { password, ...result } = user;
    return result;
  }
}
