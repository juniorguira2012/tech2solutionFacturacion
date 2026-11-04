// src/tenants/tenants.controller.ts
import { Controller, Get, Post, Put, Patch, Param, Body } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';

@Controller('admin/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Post()
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  // 1. NUEVO: Endpoint para actualizar nombre o subdominio del tenant
  @Put(':id')
  update(
    @Param('id') id: string, 
    @Body() updateData: { name?: string; subdomain?: string }
  ) {
    return this.tenantsService.update(id, updateData);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTenantStatusDto,
  ) {
    return this.tenantsService.updateStatus(id, updateStatusDto.isActive);
  }

  // 2. NUEVO: Endpoint para resetear la contraseña del administrador del tenant
  @Post(':id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.tenantsService.resetPassword(id, newPassword);
  }
}