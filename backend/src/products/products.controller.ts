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
  UseInterceptors,
  UploadedFile, // 📸 Agregado
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // 📸 Agregado
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InventoryWriteGuard } from './guards/inventory-write.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ─── 1. CREAR PRODUCTO (AHORA SOPORTA IMAGEN) ─────────────────────────
  @Post()
  @UseGuards(InventoryWriteGuard)
  @UseInterceptors(FileInterceptor('imagen'))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: any 
  ) {
  
    return this.productsService.create(createProductDto);
  }

  @Get('summary/inventory')
  getInventorySummary() {
    return this.productsService.getInventorySummary();
  }

  // ─── 3. OBTENER TODOS ──────────────────────────────────────────────────
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    let activeFilter: boolean | 'all' = true;
    if (isActive === 'false') activeFilter = false;
    if (isActive === 'all') activeFilter = 'all';

    return this.productsService.findAll({
      page: Number(page),
      limit: Number(limit),
      isActive: activeFilter,
      search,
    });
  }

  // ─── 4. OBTENER UNO POR ID ─────────────────────────────────────────────
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // ─── 5. ACTUALIZAR PRODUCTO (AHORA SOPORTA IMAGEN) ─────────────────────
  @Patch(':id')
  @UseGuards(InventoryWriteGuard)
  @UseInterceptors(FileInterceptor('imagen'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: any 
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  // ─── 6. ELIMINAR Y RESTAURAR ───────────────────────────────────────────
  @Delete(':id')
  @UseGuards(InventoryWriteGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Patch(':id/restore')
  @UseGuards(InventoryWriteGuard)
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.restore(id);
  }
}