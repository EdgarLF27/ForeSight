import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateUserRoleDto {
  @IsNotEmpty({ message: 'El ID del rol es obligatorio' })
  @IsString()
  roleId: string;
}
