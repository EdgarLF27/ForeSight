import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  ForbiddenException, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CompaniesService } from './companies.service';
import { existsSync, mkdirSync } from 'fs';
import { AuthService } from '../auth/auth.service';

@Controller('companies')
@UseGuards(AuthGuard('jwt'))
export class CompaniesController {
  constructor(
    private companiesService: CompaniesService,
    private authService: AuthService
  ) {}

  @Post()
  async create(@Body() data: { name: string }, @Request() req) {
    const user = await this.companiesService.create(req.user.userId, data);
    return this.authService.login(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    if (req.user.user.companyId !== id) throw new ForbiddenException('Acceso denegado');
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.companiesService.update(id, req.user.userId, data);
  }

  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const path = './uploads/company';
        if (!existsSync(path)) {
          mkdirSync(path, { recursive: true });
        }
        cb(null, path);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Solo imágenes (jpg, png, gif)'), false);
      }
      cb(null, true);
    }
  }))
  async uploadLogo(@Param('id') id: string, @Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo no recibido o nombre de campo incorrecto (debe ser "file")');
    const logoUrl = `/uploads/company/${file.filename}`;
    return this.companiesService.updateLogo(id, req.user.userId, logoUrl);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string, @Request() req) {
    if (req.user.user.companyId !== id) throw new ForbiddenException();
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
