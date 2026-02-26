import { IsString, Length } from 'class-validator';

export class JoinCompanyDto {
  @IsString()
  @Length(6, 6, { message: 'El código debe tener 6 caracteres' })
  inviteCode: string;
}
