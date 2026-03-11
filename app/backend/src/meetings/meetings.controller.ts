import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { MeetingStatus } from '@prisma/client';

@Controller('meetings')
@UseGuards(AuthGuard('jwt'))
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateMeetingDto) {
    // Solo técnicos o admins pueden proponer reuniones
    const userRole = req.user.user.role?.name || req.user.user.role;
    if (userRole !== 'Técnico' && userRole !== 'Administrador' && userRole !== 'EMPRESA') {
      throw new Error('Solo el personal técnico puede proponer reuniones');
    }
    
    return this.meetingsService.createProposal(req.user.userId, dto);
  }

  @Get('ticket/:ticketId')
  async findByTicket(@Param('ticketId') ticketId: string) {
    return this.meetingsService.findByTicket(ticketId);
  }

  @Get('my-meetings')
  async findMyMeetings(@Request() req) {
    return this.meetingsService.findByUser(req.user.userId);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: MeetingStatus,
    @Request() req,
  ) {
    return this.meetingsService.updateStatus(id, req.user.userId, status);
  }

  @Put(':id/repropose')
  async repropose(
    @Param('id') id: string,
    @Body('scheduledAt') scheduledAt: string,
    @Body('duration') duration: number,
    @Request() req,
  ) {
    return this.meetingsService.repropose(id, req.user.userId, scheduledAt, duration);
  }
}
