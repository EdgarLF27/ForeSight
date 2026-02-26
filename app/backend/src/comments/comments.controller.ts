import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
@UseGuards(AuthGuard('jwt'))
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('ticket/:ticketId')
  async findByTicket(@Param('ticketId') ticketId: string) {
    return this.commentsService.findByTicket(ticketId);
  }

  @Post()
  async create(@Body() createDto: CreateCommentDto, @Request() req) {
    return this.commentsService.create({
      ...createDto,
      userId: req.user.userId,
    });
  }
}
