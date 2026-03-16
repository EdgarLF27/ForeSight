import { IsString, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del área es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
