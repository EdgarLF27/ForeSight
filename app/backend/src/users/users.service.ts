import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    const where = companyId ? { companyId } : {};
    
    const users = await this.prisma.user.findMany({
      where,
      include: { role: true },
    });

    return users.map(({ password, ...u }) => u);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { company: true },
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
      include: { role: true },
    });

    return users.map(({ password, ...u }) => u);
  }

  async update(id: string, data: { name?: string; email?: string; avatar?: string }) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { company: true, role: true },
    });

    const { password, ...result } = user;
    return result;
  }

  async updateRole(id: string, roleId: string, companyId: string) {
    // Verificar que el rol existe y pertenece a la empresa (o es de sistema)
    const role = await this.prisma.role.findFirst({
      where: {
        id: roleId,
        OR: [
          { companyId },
          { isSystem: true }
        ]
      }
    });

    if (!role) {
      throw new NotFoundException('El rol especificado no existe o no pertenece a tu empresa');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { roleId },
      include: { role: true }
    });

    const { password, ...result } = user;
    return result;
  }
}
