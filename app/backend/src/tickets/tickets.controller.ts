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
  async findAll(@Request() req) {
    const companyId = req.user.user.companyId;
    
    if (!companyId) {
      return [];
    }

    // Pasamos el usuario completo para que el servicio maneje la visibilidad por rol
    return this.ticketsService.findAll(companyId, req.user.user);
  }

  @Put(':id/claim')
  async claim(@Param('id') id: string, @Request() req) {
    const companyId = req.user.user.companyId;
    const userId = req.user.userId;
    
    return this.ticketsService.claim(id, userId, companyId);
  }

  @Put(':id/unclaim')
  async unclaim(@Param('id') id: string, @Request() req) {
    const companyId = req.user.user.companyId;
    const userId = req.user.userId;
    
    return this.ticketsService.unclaim(id, userId, companyId, req.user.user);
  }

  @Get('stats')
  async getStats(@Request() req) {
    const companyId = req.user.user.companyId;
    
    if (!companyId) {
      return { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };
    }

    return this.ticketsService.getStats(companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const companyId = req.user.user.companyId;
    return this.ticketsService.findOne(id, companyId);
  }

  @Post()
  async create(@Body() createDto: CreateTicketDto, @Request() req) {
    // Registro de depuración para confirmar que el controlador recibe los datos
    console.log('Creando ticket con datos:', JSON.stringify(createDto));
    const companyId = req.user.user.companyId;
    
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
    @Request() req,
  ) {
    const companyId = req.user.user.companyId;
    return this.ticketsService.update(id, updateDto, companyId, req.user.user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const companyId = req.user.user.companyId;
    return this.ticketsService.delete(id, companyId);
  }
}
