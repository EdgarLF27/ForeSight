import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @IsInt()
  @Min(15)
  @IsOptional()
  duration?: number; // Duración en minutos

  @IsString()
  @IsNotEmpty()
  type: string; // VIRTUAL, PRESENCIAL

  @IsString()
  @IsNotEmpty()
  ticketId: string;
}
