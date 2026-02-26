import { IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1, { message: 'El comentario no puede estar vacío' })
  content: string;

  @IsString()
  ticketId: string;
}
