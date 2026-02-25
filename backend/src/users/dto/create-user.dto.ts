import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { UserRole, ExperienceLevel } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName: string;

  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsEnum(UserRole, { message: 'El rol no es válido' })
  role: UserRole;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[0-9\s-]{7,15}$/, { message: 'Formato de teléfono inválido' })
  phone?: string;

  // Campos de Empresa (Solo para COMPANY_ADMIN)
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9A-Z-]+$/, { message: 'Formato de ID Fiscal inválido' })
  companyTaxId?: string;

  @IsString()
  @IsOptional()
  companyAddress?: string;

  @IsString()
  @IsOptional()
  companyPhone?: string;

  @IsEmail({}, { message: 'Email corporativo inválido' })
  @IsOptional()
  companyEmail?: string;

  // Campos para Empleados/Técnicos
  @IsEnum(ExperienceLevel, { message: 'Nivel de experiencia no válido' })
  @IsOptional()
  experienceLevel?: ExperienceLevel;
}
