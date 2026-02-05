import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateUser(email: string, pass: string) {
    // Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        company: true, // Traer también los datos de su empresa
      },
    });

    if (user && user.password === pass) {
      // Si coinciden, devolvemos el usuario (sin la contraseña por seguridad)
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Credenciales inválidas');
  }
}
