// src/providers/roles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity'; // Importa la entidad Role

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]) // Registra la entidad en este módulo
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService], // 🌟 Exportamos solo el servicio, es más seguro y limpio
})
export class RolesModule {}