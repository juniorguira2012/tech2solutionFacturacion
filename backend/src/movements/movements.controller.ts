import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';

@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  create(@Body() createMovementDto: CreateMovementDto) {
    return this.movementsService.create(createMovementDto);
  }

  // NUEVO: Endpoint para el procesamiento masivo
  @Post('bulk-receive')
  createBulk(@Body() bulkData: { tipo: string; nota: string; items: any[]; usuarioId?: number }) {
    return this.movementsService.createBulk(bulkData);
  }

  @Get()
  findAll() {
    return this.movementsService.findAll();
  }

  @Get('product/:id')
  findByProduct(@Param('id', ParseIntPipe) id: number) {
    return this.movementsService.findByProductId(id);
  }
}
