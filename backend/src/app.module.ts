import { Module } from '@nestjs/common';
import * as path from 'path';
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

// Evaluamos los 3 posibles archivos según el entorno
let envFileName = '.env'; // Por defecto desarrollo local
if (process.env.NODE_ENV === 'production') {
  envFileName = '.env.production';
} else if (process.env.NODE_ENV === 'test') {
  envFileName = '.env.test';
}

// Subimos dos niveles para llegar a la raíz del proyecto desde backend/src/
const envPath = path.resolve(__dirname, '..', '..', envFileName);

// Debug: Esto te ayudará a ver en la consola si el backend encuentra el archivo .env
console.log(`Cargando configuración desde: ${envPath}`);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envPath,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        // Corregido para TypeScript usando coalescencia nula:
        port: parseInt(configService.get<string>('DATABASE_PORT', '5432'), 10),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: configService.get<string>('DATABASE_NAME', 'tech_two_solution_db'),
        autoLoadEntities: true,
        // Prioriza la variable de entorno DATABASE_SYNCHRONIZE si existe, 
        // de lo contrario mantiene el comportamiento por entorno.
        synchronize: configService.get<string>('DATABASE_SYNCHRONIZE') === 'true' || 
                     configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') !== 'production',
      }),
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
    ComodatosModule,
  ],
})
export class AppModule {}
