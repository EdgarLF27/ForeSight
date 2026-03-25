import { Controller, Get, Put, Post, Delete, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('clear') // Cambiamos a POST para máxima compatibilidad
  async deleteAll(@Request() req) {
    console.log('🔔 Backend: Limpiando notificaciones para el usuario:', req.user.userId);
    return this.notificationsService.deleteAll(req.user.userId);
  }

  @Get()
  async findAll(@Request() req) {
    return this.notificationsService.findAll(req.user.userId);
  }

  @Put('mark-all-read')
  async markAllRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Put(':id/read')
  async markRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }
}
