import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryCountsService } from './inventory-counts.service';
import { InventoryCountsController } from './inventory-counts.controller';
import { InventoryCount } from './entities/inventory-count.entity';
import { CountItem } from './entities/count-item.entity';
import { Product } from '../products/entities/product.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryCount, CountItem, Product, AuditLog])],
  controllers: [InventoryCountsController],
  providers: [InventoryCountsService],
  exports: [InventoryCountsService],
})
export class InventoryCountsModule {}
