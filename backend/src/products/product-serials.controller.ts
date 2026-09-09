import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Body,
  Query, // ✅ Importado correctamente
  BadRequestException,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProductSerialsService } from './product-serials.service';
import { UpdateProductSerialDto } from './dto/update-product-serial.dto';
import { AdminOnlyGuard } from './guards/admin-only.guard';

@Controller('product-serials')
export class ProductSerialsController {
  constructor(private readonly serialsService: ProductSerialsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.serialsService.findAll(
      page || limit
        ? {
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
          }
        : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serialsService.findOne(id);
  }

  @Get('product/:productId')
  findByProductId(@Param('productId', ParseIntPipe) productId: number) {
    return this.serialsService.findByProductId(productId);
  }

  @Patch(':id')
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

  @Delete(':id')
  @UseGuards(AdminOnlyGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serialsService.remove(id);
  }
}