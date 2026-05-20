import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';

@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  create(@Body() createMovementDto: CreateMovementDto) {
    return this.movementsService.create(createMovementDto);
  }

  @Post('transfer')
  transferBulk(@Body() transferData: any) {
    return this.movementsService.transferBulk(transferData);
  }

  @Post('bulk-receive')
  createBulk(@Body() bulkData: { tipo: string; nota: string; items: any[]; usuarioId?: number; referencia?: string }) {
    return this.movementsService.createBulk(bulkData);
  }

  @Get()
  findAll(@Query('productoId') productoId?: string) {
    if (productoId) {
      return this.movementsService.findByProductId(Number(productoId));
    }
    return this.movementsService.findAll();
  }

  @Get('product/:id')
  findByProduct(@Param('id', ParseIntPipe) id: number) {
    return this.movementsService.findByProductId(id);
  }
}
