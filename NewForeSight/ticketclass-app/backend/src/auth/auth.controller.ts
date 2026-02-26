import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JoinCompanyDto } from './dto/join-company.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('join-company')
  @UseGuards(AuthGuard('jwt'))
  async joinCompany(@Body() joinDto: JoinCompanyDto, @Request() req) {
    return this.authService.joinCompany(req.user.userId, joinDto.inviteCode);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    return req.user;
  }
}
