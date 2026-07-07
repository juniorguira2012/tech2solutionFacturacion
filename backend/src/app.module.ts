// src/app.module.ts
import { Module } from '@nestjs/common';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { InventoryCountsModule } from './inventory-counts/inventory-counts.module';
import { MovementsModule } from './movements/movements.module';
import { SalesModule } from './sales/sales.module';
import { ProvidersModule } from './providers/providers.module';
import { WarehousesModule } from './movements/warehouses.module';
import { UsersModule } from './providers/users.module';
import { ClientsModule } from './providers/clients.module';
import { RolesModule } from './providers/roles.module';
import { ComodatosModule } from './comodatos/comodatos.module';
import { UnitsOfMeasureModule } from './units-of-measure/units-of-measure.module';
import { ProductSerialsModule } from './products/product-serials.module';
import { CategoriesModule } from './categories/categories.module';
import { DatabaseModule } from './database/database.module'; 
import { ScheduleModule } from '@nestjs/schedule'; // 🌟 Importado correctamente
import {InventoryBatchesModule} from './inventory-batches/inventory-batches.module'; // 🌟 Importado correctamente

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`),
        path.resolve(__dirname, '../../.env'),
      ],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const logger = new Logger('TypeOrmModule');
        const synchronize = configService.get<boolean>('DATABASE_SYNCHRONIZE', false);
        if (synchronize) {
          logger.warn('DATABASE_SYNCHRONIZE está habilitado. No usar en producción.');
        }
        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST', 'localhost'),
          port: configService.get<number>('DATABASE_PORT', 5432),
          username: configService.get<string>('DATABASE_USER', 'postgres'),
          password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
          database: configService.get<string>('DATABASE_NAME', 'tech_two_solution_db'),
          autoLoadEntities: true,
          synchronize,
          logging: configService.get<string>('NODE_ENV') !== 'production',
        };
      },
    }),
    ScheduleModule.forRoot(), // 🚀 ¡REPARACIÓN! Inicializa el motor de Crons globalmente
    ProductsModule,
    InventoryCountsModule,
    MovementsModule,
    SalesModule,
    ProvidersModule,
    WarehousesModule,
    UsersModule,
    ClientsModule,
    RolesModule,
    ComodatosModule,
    UnitsOfMeasureModule,
    ProductSerialsModule,
    CategoriesModule,
    DatabaseModule, 
    InventoryBatchesModule,
  ],
})
export class AppModule {}