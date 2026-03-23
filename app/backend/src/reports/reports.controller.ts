import {
  Controller,
  Get,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
// import { Permissions } from '../common/decorators/permissions.decorator'; // Podríamos usarlo si hay un permiso específico

@Controller('reports')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('admin-general')
  async downloadAdminReport(@Request() req, @Res() res: Response) {
    // Solo permitimos a los administradores (usando el companyId del usuario)
    // En este sistema, el dueño de la compañía suele ser el Admin
    const companyId = req.user.user.companyId;
    return this.reportsService.generateAdminReport(companyId, res);
  }
}
