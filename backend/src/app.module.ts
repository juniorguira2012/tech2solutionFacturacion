import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'todobien777', // La que reseteamos en WSL
      database: 'tech_two_solution_db',
      autoLoadEntities: true,
      synchronize: true, // Esto creará las tablas automáticamente al guardar cambios
    }),
    ProductsModule,
  ],
})
export class AppModule {}

