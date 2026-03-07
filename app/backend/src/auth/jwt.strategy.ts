import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { 
        company: true,
        role: {
          include: {
            permissions: true
          }
        }
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const permissions = user.role?.permissions?.map(p => p.name) || [];

    return {
      userId: payload.sub,
      email: payload.email,
      role: user.role?.name,
      companyId: user.companyId, // Usar el de la DB
      permissions,
      user,
    };
  }
}
