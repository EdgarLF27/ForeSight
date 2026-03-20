import { 
  Controller, 
  Get, 
  Put, 
  Patch, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  Query, 
  Post, 
  Delete,
  UseInterceptors, 
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @Put('me')
  async updateProfile(@Request() req, @Body() updateDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateDto);
  }

  @Patch('me/password')
  async updatePassword(@Request() req, @Body() data: any) {
    return this.usersService.updatePassword(req.user.userId, data);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Solo se permiten imágenes (jpg, png, gif)'), false);
      }
      cb(null, true);
    }
  }))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo no subido');
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(req.user.userId, avatarUrl);
  }

  @Get()
  async findAll(@Query('companyId') companyId?: string) {
    return this.usersService.findAll(companyId);
  }

  @Get('technicians')
  @Permissions('tickets:assign')
  async findTechnicians(@Request() req, @Query('areaId') areaId?: string) {
    return this.usersService.findTechnicians(req.user.companyId, areaId);
  }

  @Patch(':id/role')
  @Permissions('users:edit')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @Request() req
  ) {
    return this.usersService.updateRole(id, updateRoleDto.roleId, req.user.companyId);
  }

  @Patch(':id/area')
  @Permissions('users:edit')
  async updateArea(
    @Param('id') id: string,
    @Body('areaId') areaId: string | null,
    @Request() req
  ) {
    return this.usersService.updateArea(id, areaId, req.user.companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Permissions('users:edit')
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.usersService.delete(id, req.user.companyId);
  }
}
