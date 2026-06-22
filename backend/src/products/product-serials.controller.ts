import { Controller, Get, Param, ParseIntPipe, Patch, Body } from '@nestjs/common';
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

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductSerialDto,
  ) {
    return this.serialsService.updateStatus(id, updateDto.status);
  }
}