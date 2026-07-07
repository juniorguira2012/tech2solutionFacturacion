import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { InventoryBatchesService } from './inventory-batches.service'; // Asegúrate de usar el nombre real de tu servicio
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';
import { UpdateInventoryBatchDto } from './dto/update-inventory-batch.dto';

@Controller('inventory-batches') // 🚀 Esto mapea a http://localhost:3000/api/inventory-batches
export class InventoryBatchesController {
  constructor(private readonly batchesService: InventoryBatchesService) {}

  @Get()
  findAll() {
    return this.batchesService.findAllBatches();
  }

  @Post()
  create(@Body() createDto: CreateInventoryBatchDto) {
    return this.batchesService.createBatch(createDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateDto: UpdateInventoryBatchDto
  ) {
    return this.batchesService.updateBatch(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.batchesService.removeBatch(id);
  }
}