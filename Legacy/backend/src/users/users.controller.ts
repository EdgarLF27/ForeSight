import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Get('companies')
  getCompanies() {
    return this.usersService.getCompanies();
  }

  @Get('companies/:id/areas')
  getAreas(@Param('id') id: string) {
    return this.usersService.getAreas(parseInt(id));
  }

  @Post('link-company')
  linkCompany(@Body() body: { userId: number; inviteCode: string }) {
    return this.usersService.linkCompany(body.userId, body.inviteCode);
  }
}
