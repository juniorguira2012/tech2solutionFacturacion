import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comodato } from './entities/comodato.entity';
import { Product } from '../products/entities/product.entity';
import { ComodatosService } from './comodatos.service';
import { ComodatosController } from './comodatos.controller';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comodato, Product]),
    ProvidersModule,
  ],
  providers: [ComodatosService],
  controllers: [ComodatosController],
  exports: [ComodatosService, TypeOrmModule],
})
export class ComodatosModule {}
