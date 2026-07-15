// src/providers/roles.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getRoles() {
    return await this.rolesService.findAll();
  }

  @Post('update-config')
  async updateConfig(@Body() body: { name: string; config: any }) {
    return await this.rolesService.updateConfig(body.name, body.config);
  }
}