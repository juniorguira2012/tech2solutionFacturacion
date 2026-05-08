import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importa esto
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity'; // Importa tu entidad
import { InventoryWriteGuard } from './guards/inventory-write.guard';

@Module({
  imports: [
    // Esto es lo que le dice a Nest: "Crea la tabla para esta entidad"
    TypeOrmModule.forFeature([Product]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, InventoryWriteGuard],
})
export class ProductsModule {}
