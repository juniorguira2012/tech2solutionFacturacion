import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Headers, UnauthorizedException } from '@nestjs/common';
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
    if (permission !== 'full') throw new UnauthorizedException();
    return this.service.create(data);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any, @Headers('x-inventory-permission') permission: string) {
    if (permission !== 'full') throw new UnauthorizedException();
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Headers('x-inventory-permission') permission: string) {
    if (permission !== 'full') throw new UnauthorizedException();
    return this.service.remove(id);
  }
}