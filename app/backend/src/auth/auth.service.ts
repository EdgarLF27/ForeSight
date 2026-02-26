import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    
    throw new UnauthorizedException('Credenciales inválidas');
  }

  async login(user: any) {
    const payload = { 
      sub: user.id_user, 
      email: user.email, 
      role: user.role,
      id_company_fk: user.id_company_fk 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id_user: user.id_user,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        id_company_fk: user.id_company_fk,
        company: user.company,
      },
    };
  }

  async register(data: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // LÓGICA DE REGISTRO PARA EMPRESA (ADMIN)
    if (data.role === UserRole.COMPANY_ADMIN) {
      return this.prisma.$transaction(async (tx) => {
        // 1. Crear al usuario primero (él será el dueño)
        const user = await tx.user.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            role: UserRole.COMPANY_ADMIN,
            phone: data.phone,
          },
        });

        // 2. Generar código tipo Classroom
        const inviteCode = 'FS-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        // 3. Crear la empresa vinculada al usuario
        const company = await tx.company.create({
          data: {
            legalName: data.companyName,
            taxId: data.companyTaxId,
            address: data.companyAddress,
            phone: data.companyPhone,
            email: data.companyEmail,
            inviteCode: inviteCode,
            ownerId: user.id_user,
          },
        });

        // 4. Vincular al usuario con su nueva empresa
        const updatedUser = await tx.user.update({
          where: { id_user: user.id_user },
          data: { id_company_fk: company.id_company },
          include: { company: true },
        });

        return this.login(updatedUser);
      });
    }

    // LÓGICA PARA EMPLEADOS / TÉCNICOS
    const user = await this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        phone: data.phone,
        experienceLevel: data.experienceLevel,
      },
      include: { company: true },
    });

    return this.login(user);
  }

  async joinCompany(userId: string, inviteCode: string) {
    const company = await this.prisma.company.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    });

    if (!company) {
      throw new UnauthorizedException('Código de invitación inválido');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id_user: userId },
      data: { id_company_fk: company.id_company },
      include: { company: true },
    });

    const { password, ...result } = updatedUser;
    return {
      message: 'Te has unido a la empresa exitosamente',
      user: result,
    };
  }
}
