import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { Provider } from './provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Provider])], // <-- CRUCIAL para que TypeORM cree la tabla
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [TypeOrmModule, ProvidersService] // Exporta el módulo y el servicio para que otros módulos puedan usarlos
})
export class ProvidersModule {}