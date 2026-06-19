import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovementsService } from './movements.service';
import { MovementsController } from './movements.controller';
import { Movement } from './entities/movement.entity';
import { Product } from '../products/entities/product.entity';
import { ProductWarehouseStock } from '../products/entities/product-warehouse-stock.entity';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { Technician } from './entities/technician.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Movement, Product, ProductWarehouseStock, InventoryBatch, Technician]),
  ],
  controllers: [MovementsController],
  providers: [MovementsService],
  exports: [MovementsService, TypeOrmModule],
})
export class MovementsModule {}
