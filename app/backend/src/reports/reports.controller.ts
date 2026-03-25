import {
  Controller,
  Get,
  UseGuards,
  Request,
  Res,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('admin-general')
  async downloadAdminReport(
    @Request() req, 
    @Res() res: Response,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const companyId = req.user.user.companyId;
    return this.reportsService.generateAdminReport(companyId, startDate, endDate, res);
  }
}
