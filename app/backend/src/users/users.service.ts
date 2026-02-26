import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    const where = companyId ? { companyId } : {};
    
    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        companyId: true,
        createdAt: true,
      },
    });

    return users;
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
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        companyId: true,
        createdAt: true,
      },
    });

    return users;
  }

  async update(id: string, data: { name?: string; email?: string; avatar?: string }) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { company: true },
    });

    const { password, ...result } = user;
    return result;
  }
}
