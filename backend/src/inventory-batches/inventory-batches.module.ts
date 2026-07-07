import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryBatchesService } from './inventory-batches.service';
import { InventoryBatchesController } from './inventory-batches.controller';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { Product } from '../products/entities/product.entity'; // Tu entidad de producto

@Module({
  imports: [
    // 🌟 IMPORTANTÍSIMO: Registrar ambas entidades aquí para que el servicio las pueda inyectar
    TypeOrmModule.forFeature([InventoryBatch, Product])
  ],
  controllers: [InventoryBatchesController],
  providers: [InventoryBatchesService],
  exports: [InventoryBatchesService], // Por si necesitas usar lotes en otro módulo más adelante
})
export class InventoryBatchesModule {}