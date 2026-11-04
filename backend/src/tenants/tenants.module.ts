import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import {AdminAuthController} from './admin-auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [TenantsController, AdminAuthController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}