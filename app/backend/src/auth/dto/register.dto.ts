import { IsEmail, IsString, MinLength, IsOptional, Matches, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
  name: string;

  @IsOptional()
  @IsString()
  @IsIn(['EMPRESA', 'EMPLEADO', 'TECNICO', 'ADMINISTRADOR'], { message: 'El rol debe ser válido (EMPRESA, EMPLEADO, TECNICO, ADMINISTRADOR)' })
  role?: string;

  @IsOptional()
  @IsString()
  companyName?: string;
}
