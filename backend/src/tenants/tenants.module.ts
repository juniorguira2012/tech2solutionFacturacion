import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';

import {AdminAuthController} from '../admin/admin-auth.controller';
import { MasterAdmin } from '../admin/entities/master-admin.entity';
import { MasterAdminSeedService } from '../admin/master-admin-seed.service';
import { AdminAuthService } from '../admin/admin-auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, MasterAdmin])],
  controllers: [TenantsController, AdminAuthController],
  providers: [TenantsService, MasterAdminSeedService, AdminAuthService],
  exports: [TenantsService],
})
export class TenantsModule {}