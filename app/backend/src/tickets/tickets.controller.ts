import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('tickets')
@UseGuards(AuthGuard('jwt'))
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  async findAll(@Request() req, @Query('myTickets') myTickets?: string) {
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return [];
    }

    const userId = myTickets === 'true' ? req.user.userId : undefined;
    return this.ticketsService.findAll(companyId, userId);
  }

  @Get('stats')
  async getStats(@Request() req) {
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };
    }

    return this.ticketsService.getStats(companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateTicketDto, @Request() req) {
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return { error: 'Debes pertenecer a una empresa para crear tickets' };
    }

    return this.ticketsService.create({
      ...createDto,
      companyId,
      createdById: req.user.userId,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
