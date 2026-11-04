export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  dbName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDto {
  name: string;
  subdomain: string;
  adminEmail?: string;
  adminPassword?: string;
}