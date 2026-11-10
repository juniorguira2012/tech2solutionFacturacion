import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Headers, ForbiddenException } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly service: WarehousesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() data: any, @Headers('x-inventory-permission') permission: string) {
    if (permission !== 'full' && permission !== 'create') {
      throw new ForbiddenException('No tienes permiso para crear almacenes');
    }
    return this.service.create(data);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any, @Headers('x-inventory-permission') permission: string) {
    if (permission !== 'full' && permission !== 'edit') {
      throw new ForbiddenException('No tienes permiso para editar almacenes');
    }
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Headers('x-inventory-permission') permission: string) {
    if (permission !== 'full' && permission !== 'delete') {
      throw new ForbiddenException('No tienes permiso para eliminar almacenes');
    }
    return this.service.remove(id);
  }
}