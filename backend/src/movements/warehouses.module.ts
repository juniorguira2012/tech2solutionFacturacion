import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './warehouse.entity';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse])], // <-- CRUCIAL: Registra la entidad aquí
  controllers: [WarehousesController],
  providers: [WarehousesService],
  exports: [WarehousesService], // Por si necesitas usarlo en productos más adelante
})
export class WarehousesModule {}