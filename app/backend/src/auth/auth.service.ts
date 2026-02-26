import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      companyId: user.companyId 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        companyId: user.companyId,
        company: user.company,
      },
    };
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    companyName?: string;
    companyTaxId?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.$transaction(async (tx) => {
      // 1. Crear el usuario con su nombre y apellido
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          phone: data.phone,
        },
      });

      // 2. Si es rol EMPRESA, crear la organización completa
      if (data.role === UserRole.EMPRESA && data.companyName) {
        const inviteCode = this.generateInviteCode();
        
        const company = await tx.company.create({
          data: {
            name: data.companyName,
            taxId: data.companyTaxId || 'PENDIENTE',
            address: data.companyAddress || 'PENDIENTE',
            phone: data.companyPhone,
            email: data.companyEmail,
            inviteCode,
            ownerId: user.id,
          },
        });

        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { companyId: company.id },
          include: { company: true },
        });

        return this.login(updatedUser);
      }

      return this.login(user);
    });
  }

  async joinCompany(userId: string, inviteCode: string) {
    const company = await this.prisma.company.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    });

    if (!company) {
      throw new UnauthorizedException('Código de invitación inválido');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { companyId: company.id },
      include: { company: true },
    });

    const { password: _, ...result } = updatedUser;
    return {
      message: 'Te has unido a la empresa exitosamente',
      user: result,
    };
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
