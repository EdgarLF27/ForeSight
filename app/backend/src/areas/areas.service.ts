import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';

@Injectable()
export class AreasService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.area.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const area = await this.prisma.area.findUnique({
      where: { id },
    });

    if (!area || area.companyId !== companyId) {
      throw new NotFoundException('Área no encontrada');
    }

    return area;
  }

  async create(companyId: string, dto: CreateAreaDto) {
    return this.prisma.area.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async update(id: string, companyId: string, dto: CreateAreaDto) {
    await this.findOne(id, companyId);

    return this.prisma.area.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, companyId: string) {
    await this.findOne(id, companyId);

    await this.prisma.area.delete({
      where: { id },
    });

    return { message: 'Área eliminada exitosamente' };
  }
}
