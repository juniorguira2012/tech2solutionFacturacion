import { Controller, Get, Param, ParseIntPipe, Patch, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ProductSerialsService } from './product-serials.service';
import { UpdateProductSerialDto } from './dto/update-product-serial.dto';

@Controller('product-serials')
export class ProductSerialsController {
  constructor(private readonly serialsService: ProductSerialsService) {}

  @Get()
  findAll() {
    return this.serialsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serialsService.findOne(id);
  }

  @Get('/product/:productId')
  findByProductId(@Param('productId', ParseIntPipe) productId: number) {
    return this.serialsService.findByProductId(productId);
  }

  @Patch(':id')
  // @UseGuards(InventoryWriteGuard) // Opcional: Proteger con el guard de escritura
  updateSerialNumber(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductSerialDto,
  ) {
    return this.serialsService.updateSerialNumber(id, updateDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductSerialDto,
  ) {
    if (!updateDto.status) {
      throw new BadRequestException('El campo "status" es requerido para esta operación.');
    }
    return this.serialsService.updateStatus(id, updateDto.status);
  }
}