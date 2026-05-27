import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'tech_two_solution_db',
    autoLoadEntities: true,
    logging: true,
    synchronize: true,
  }),
    ProductsModule,
    InventoryCountsModule,
    MovementsModule,
    SalesModule,
    ProvidersModule,  
    WarehousesModule,
    UsersModule,
    ClientsModule,
    RolesModule,
  ],
})
export class AppModule {}
