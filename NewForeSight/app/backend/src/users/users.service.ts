import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    const where = companyId ? { id_company_fk: companyId } : {};
    
    const users = await this.prisma.user.findMany({
      where,
      select: {
        id_user: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        id_company_fk: true,
        createdAt: true,
      },
    });

    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id_user: id },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...result } = user;
    return result;
  }

  async findByCompany(id_company_fk: string) {
    const users = await this.prisma.user.findMany({
      where: { id_company_fk },
      select: {
        id_user: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        id_company_fk: true,
        createdAt: true,
      },
    });

    return users;
  }

  async update(id: string, data: any) {
    const user = await this.prisma.user.update({
      where: { id_user: id },
      data,
      include: { company: true },
    });

    const { password, ...result } = user;
    return result;
  }
}
