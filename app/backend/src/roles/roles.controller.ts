import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesService } from './roles.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('roles')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions('roles:create')
  create(@Request() req, @Body() data: { name: string; description?: string; permissionIds: string[] }) {
    return this.rolesService.create(req.user.companyId, data);
  }

  @Get()
  @Permissions('roles:view')
  findAll(@Request() req) {
    return this.rolesService.findAll(req.user.companyId);
  }

  @Get(':id')
  @Permissions('roles:view')
  findOne(@Param('id') id: string, @Request() req) {
    return this.rolesService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Permissions('roles:edit')
  update(
    @Param('id') id: string, 
    @Request() req, 
    @Body() data: { name?: string; description?: string; permissionIds?: string[] }
  ) {
    return this.rolesService.update(id, req.user.companyId, data);
  }

  @Delete(':id')
  @Permissions('roles:delete')
  remove(@Param('id') id: string, @Request() req) {
    return this.rolesService.remove(id, req.user.companyId);
  }
}
