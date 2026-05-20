import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movement } from './entities/movement.entity';
import { MovementsService } from './movements.service';
import { MovementsController } from './movements.controller';
import { Product } from '../products/entities/product.entity';
import { ProductWarehouseStock } from '../products/entities/product-warehouse-stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movement, Product, ProductWarehouseStock])],
  controllers: [MovementsController],
  providers: [MovementsService],
  exports: [MovementsService],
})
export class MovementsModule {}
