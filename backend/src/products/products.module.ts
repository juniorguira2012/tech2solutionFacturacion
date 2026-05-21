import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProvidersModule } from '../providers/providers.module'; // <-- Importamos el módulo completo

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]), // Aquí solo dejamos la entidad nativa de este módulo
    ProvidersModule, // <-- ¡AQUÍ! Al importar el módulo, NestJS hereda el ProviderRepository automáticamente
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, TypeOrmModule], 
})
export class ProductsModule {}