import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterAdmin } from './entities/master-admin.entity';
import { MasterAdminSeedService } from './master-admin-seed.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([MasterAdmin]), // 👈 Registra el repositorio
  ],
  providers: [AdminAuthService, MasterAdminSeedService],
  controllers: [AdminAuthController],
})
export class AdminModule {}