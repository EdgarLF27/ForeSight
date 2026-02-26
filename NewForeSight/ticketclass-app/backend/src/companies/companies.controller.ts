import { Controller, Get, Post, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompaniesService } from './companies.service';

@Controller('companies')
@UseGuards(AuthGuard('jwt'))
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    // Verify user belongs to this company
    if (req.user.companyId !== id) {
      throw new ForbiddenException('No tienes acceso a esta empresa');
    }
    return this.companiesService.findOne(id);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string, @Request() req) {
    if (req.user.companyId !== id) {
      throw new ForbiddenException('No tienes acceso a esta empresa');
    }
    return this.companiesService.getStats(id);
  }

  @Post(':id/regenerate-code')
  async regenerateCode(@Param('id') id: string, @Request() req) {
    return this.companiesService.regenerateInviteCode(id, req.user.userId);
  }

  @Get('verify-code/:code')
  async verifyCode(@Param('code') code: string) {
    return this.companiesService.findByInviteCode(code);
  }
}
