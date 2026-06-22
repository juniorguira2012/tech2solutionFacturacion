import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSerial } from './entities/product-serial.entity';
import { ProductSerialsService } from './product-serials.service';
import { ProductSerialsController } from './product-serials.controller';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSerial, Product])],
  providers: [ProductSerialsService],
  controllers: [ProductSerialsController],
  exports: [ProductSerialsService],
})
export class ProductSerialsModule {}