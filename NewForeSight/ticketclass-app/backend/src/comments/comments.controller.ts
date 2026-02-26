import {
  Controller,
  Get,
  Post,
  Delete,
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
  async findByTicket(@Param('ticketId') ticketId: string, @Request() req) {
    const companyId = req.user.companyId;
    return this.commentsService.findByTicket(ticketId, companyId);
  }

  @Post()
  async create(@Body() createDto: CreateCommentDto, @Request() req) {
    const companyId = req.user.companyId;
    return this.commentsService.create({
      ...createDto,
      userId: req.user.userId,
    }, companyId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const companyId = req.user.companyId;
    return this.commentsService.delete(id, req.user.userId, companyId);
  }
}
