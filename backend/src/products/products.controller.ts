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
  UploadedFile,
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

  // 1. Rutas específicas primero (sin parámetros dinámicos ambiguos)
  @Get('summary/inventory')
  getInventorySummary() {
    return this.productsService.getInventorySummary();
  }

  // 2. Ruta general de listado
  @Get()
  async findAll(
    @Query('page') page?: string | number,
    @Query('limit') limit?: string | number,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page !== undefined ? Number(page) : 1;
    const limitNum = limit !== undefined ? Number(limit) : 20;

    let activeFilter: boolean | 'all' = true;
    if (isActive === 'false') activeFilter = false;
    if (isActive === 'all') activeFilter = 'all';
    if (isActive === 'true') activeFilter = true;

    return await this.productsService.findAll({
      page: isNaN(pageNum) ? 1 : pageNum,
      limit: isNaN(limitNum) ? 20 : limitNum,
      isActive: activeFilter,
      search,
    });
  }

  // 3. Ruta genérica con parámetro al final
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