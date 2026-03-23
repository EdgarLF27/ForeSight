import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { 
        company: true,
        area: true, // INCLUIMOS EL ÁREA
        role: {
          include: {
            permissions: true
          }
        }
      },
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

  async googleLogin(accessToken: string) {
    try {
      // Obtener info del usuario usando el access_token
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      const payload = await response.json();
      
      if (!payload || payload.error) {
        throw new UnauthorizedException('Token de Google inválido o expirado');
      }

      const { email, name, picture } = payload;

      let user = await this.prisma.user.findUnique({
        where: { email },
        include: { 
          company: true,
          area: true, 
          role: { include: { permissions: true } }
        },
      });

      if (!user) {
        // BUSCAR ROL DE EMPLEADO POR DEFECTO
        const role = await this.prisma.role.findFirst({
          where: { name: { contains: 'Empleado', mode: 'insensitive' }, isSystem: true }
        });
        user = await this.prisma.user.create({
          data: {
            email: email!,
            name: name!,
            avatar: picture,
            password: await bcrypt.hash(Math.random().toString(36), 10),
            roleId: role?.id,
          },
          include: { 
            company: true,
            area: true, 
            role: { include: { permissions: true } }
          },
        });
      }

      const { password: _, ...result } = user;
      return this.login(result);
    } catch (error) {
      this.logger.error('Error en Google Login', error);
      throw new UnauthorizedException('Fallo en la autenticación con Google');
    }
  }

  async login(user: any) {
    const permissions = user.role?.permissions?.map(p => p.name) || [];
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role?.name,
      permissions,
      companyId: user.companyId 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        area: user.area, // INCLUIMOS EL OBJETO ÁREA COMPLETO
        avatar: user.avatar,
        companyId: user.companyId,
        company: user.company,
        permissions
      },
    };
  }

  async register(data: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Todos los registros manuales inician como 'Empleado' base sin empresa asignada
    const role = await this.prisma.role.findFirst({
      where: { name: { contains: 'Empleado', mode: 'insensitive' }, isSystem: true }
    });

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        roleId: role?.id,
      },
      include: { 
        company: true,
        area: true, 
        role: {
          include: { permissions: true }
        }
      },
    });

    const { password: _, ...result } = user;
    return this.login(result);
  }

  async joinCompany(userId: string, inviteCode: string) {
    const company = await this.prisma.company.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    });

    if (!company) {
      throw new UnauthorizedException('Código de invitación inválido');
    }

    // BUSCAR ÁREA GENERAL DE LA EMPRESA
    const defaultArea = await this.prisma.area.findFirst({
      where: { 
        companyId: company.id,
        name: { equals: 'General', mode: 'insensitive' }
      }
    });

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { 
        companyId: company.id,
        areaId: defaultArea?.id || null // ASIGNAR ÁREA GENERAL SI EXISTE
      },
      include: { 
        company: true,
        area: true,
        role: {
          include: { permissions: true }
        }
      },
    });

    const { password: _, ...result } = updatedUser;
    
    // Generar nuevo token con el nuevo companyId y rol
    const loginResult = await this.login(result);

    return {
      message: 'Te has unido a la empresa exitosamente',
      ...loginResult, // Devuelve access_token y user actualizado
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
