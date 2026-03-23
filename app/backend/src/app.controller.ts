import { Controller, Get, Head } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Head()
  getHello(): string {
    return 'ForeSight API is running';
  }
}
