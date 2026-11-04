// src/tenants/dto/update-tenant-status.dto.ts
import { IsBoolean } from 'class-validator';

export class UpdateTenantStatusDto {
  @IsBoolean()
  isActive: boolean;
}