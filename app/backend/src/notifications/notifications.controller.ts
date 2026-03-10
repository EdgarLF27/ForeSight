import { Controller, Get, Put, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  // Manejador de notificaciones del sistema
  constructor(private notificationsService: NotificationsService) {}

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
