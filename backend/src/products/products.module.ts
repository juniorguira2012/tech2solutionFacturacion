import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductSerial } from './entities/product-serial.entity'; // 🌟 1. Asegúrate de importarlo
import { Provider } from '../providers/entities/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, 
      ProductSerial,
      Provider
    ])
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}