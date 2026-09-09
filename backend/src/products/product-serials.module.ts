import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSerial } from './entities/product-serial.entity';
import { ProductSerialsService } from './product-serials.service';
import { ProductSerialsController } from './product-serials.controller';
import { Movement } from '../movements/entities/movement.entity';
import { Product } from './entities/product.entity';
import { AdminOnlyGuard } from './guards/admin-only.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSerial, Product, Movement])],
  providers: [ProductSerialsService, AdminOnlyGuard],
  controllers: [ProductSerialsController],
  exports: [ProductSerialsService],
})
export class ProductSerialsModule {}