import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('areas')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AreasController {
  constructor(private areasService: AreasService) {}

  @Get()
  async findAll(@Request() req) {
    const companyId = req.user.user.companyId;
    return this.areasService.findAll(companyId);
  }

  @Post()
  //@Permissions('areas:manage') // Podríamos añadir este permiso si existiera, por ahora usaremos lógica de Admin en el Guard o servicio
  async create(@Request() req, @Body() dto: CreateAreaDto) {
    const companyId = req.user.user.companyId;
    return this.areasService.create(companyId, dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: CreateAreaDto,
  ) {
    const companyId = req.user.user.companyId;
    return this.areasService.update(id, companyId, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const companyId = req.user.user.companyId;
    return this.areasService.delete(id, companyId);
  }
}
