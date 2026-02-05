import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() data: any) {
    return this.usersService.register(data);
  }

  @Get('companies')
  getCompanies() {
    return this.usersService.getCompanies();
  }

  @Get('companies/:id/areas')
  getAreas(@Param('id') id: string) {
    return this.usersService.getAreas(parseInt(id));
  }
}
