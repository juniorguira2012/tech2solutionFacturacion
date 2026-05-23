import { Controller, Get, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Post('update-config')
  update(@Body() data: { name: string, config: any }, @Headers('x-user-role') role: string) {
    if (role !== 'admin') throw new UnauthorizedException('Permiso denegado');
    return this.rolesService.updateConfig(data.name, data.config);
  }
}