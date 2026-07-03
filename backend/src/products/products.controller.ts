// backend/src/products/products.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InventoryWriteGuard } from './guards/inventory-write.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(InventoryWriteGuard) // 📊 Luego evalúa si tiene permiso para crear
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query('isActive') isActive?: string) {
    console.log("📢 ¡PROBANDO SI EL BACKEND EN PORTAINER SE ACTUALIZÓ DE VERDAD! 📢");
    let showActive: boolean | 'all' = true;
    if (isActive === 'false') showActive = false;
    if (isActive === 'all') showActive = 'all';
    return this.productsService.findAll(showActive);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(InventoryWriteGuard) // 📊 Evalúa si tiene permiso para editar
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(InventoryWriteGuard) // 📊 Evalúa si tiene permiso para eliminar
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Patch(':id/restore')
  @UseGuards(InventoryWriteGuard)
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.restore(id);
  }
}