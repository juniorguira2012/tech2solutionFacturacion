import { Controller, Post, Get, Param, Body, Headers } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post()
  async create(
    @Body() createSaleDto: CreateSaleDto,
    @Headers('x-user-id') userId: string,
  ) {
    const dto = {
      ...createSaleDto,
      vendedorId: userId || createSaleDto.vendedorId,
    };
    return this.salesService.create(dto);
  }

  @Get()
  async findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.salesService.findOne(parseInt(id));
  }
}
