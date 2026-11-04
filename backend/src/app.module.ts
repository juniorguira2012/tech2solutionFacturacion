// src/app.module.ts
import { Module, NestModule, MiddlewareConsumer, RequestMethod, Logger } from '@nestjs/common';
import { TenantMiddleware } from './common/middlewares/tenant.middleware';
import * as path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { InventoryCountsModule } from './inventory-counts/inventory-counts.module';
import { MovementsModule } from './movements/movements.module';
import { SalesModule } from './sales/sales.module';
import { ProvidersModule } from './providers/providers.module';
import { WarehousesModule } from './movements/warehouses.module';
import { UsersModule } from './user/users.module';
import { ClientsModule } from './client/clients.module';
import { RolesModule } from './roles/roles.module';
import { ComodatosModule } from './comodatos/comodatos.module';
import { UnitsOfMeasureModule } from './units-of-measure/units-of-measure.module';
import { ProductSerialsModule } from './products/product-serials.module';
import { CategoriesModule } from './categories/categories.module';
import { DatabaseModule } from './database/database.module'; 
import { InventoryBatchesModule } from './inventory-batches/inventory-batches.module';
import { ProjectsModule } from './projects/projects.module';
import { TenantsModule } from './tenants/tenants.module';
import { TenantsService } from './tenants/tenants.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`),
        path.resolve(__dirname, '../.env'),
        path.resolve(__dirname, '../../.env'),
      ],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const logger = new Logger('TypeOrmModule');
        
        const rawSync = configService.get('DATABASE_SYNCHRONIZE');
        const synchronize = String(rawSync).toLowerCase() === 'true';

        if (synchronize) {
          logger.warn('DATABASE_SYNCHRONIZE está habilitado. No usar en producción.');
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST', 'localhost'),
          port: configService.get<number>('DATABASE_PORT', 5432),
          username: configService.get<string>('DATABASE_USER', 'postgres'),
          password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
          database: configService.get<string>('DATABASE_NAME') || (configService.get<string>('NODE_ENV') === 'production' ? 'tech_two_solution_db' : 'tech2_prueba_db'),
          autoLoadEntities: true,
          synchronize,
          logging: configService.get<string>('NODE_ENV') !== 'production',
        };
      },
    }),
    ScheduleModule.forRoot(),
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
    ProjectsModule,
    TenantsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        'admin/tenants',
        'admin/tenants/*',
        'api/admin/tenants',
        'api/admin/tenants/*',
        'admin/auth',
        'admin/auth/*',
        'api/admin/auth',
        'api/admin/auth/*',
      )
      .forRoutes('*');
  }
}