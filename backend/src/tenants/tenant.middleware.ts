// src/tenants/tenant.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

// Extender la interfaz Request de Express para tipar el tenant y su DataSource
export interface TenantRequest extends Request {
  tenant?: Tenant;
  tenantDataSource?: DataSource;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private static tenantDataSources = new Map<string, DataSource>();

  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private dataSource: DataSource,
  ) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    const subdomain = (req.headers['x-tenant-subdomain'] || req.headers['x-tenant-id']) as string;

    // 🔍 Imprimimos en consola cada vez que el middleware intercepta una llamada
    console.log(`🔍 [TenantMiddleware] Ruta: ${req.method} ${req.url} | Subdominio recibido:`, subdomain);

    if (!subdomain) {
      console.warn(`❌ [TenantMiddleware] Rechazado: Falta cabecera de tenant en ${req.url}`);
      throw new UnauthorizedException('Falta la cabecera x-tenant-subdomain o x-tenant-id para identificar al tenant.');
    }

    const tenant = await this.tenantRepository.findOne({ where: { subdomain } });

    if (!tenant) {
      console.warn(`❌ [TenantMiddleware] Rechazado: Tenant '${subdomain}' no existe en BD central.`);
      throw new NotFoundException(`No se encontró ningún tenant registrado con el subdominio: '${subdomain}'.`);
    }

    if (!tenant.isActive) {
      throw new ForbiddenException(`El tenant '${tenant.name}' se encuentra suspendido temporalmente.`);
    }

    let tenantDataSource = TenantMiddleware.tenantDataSources.get(tenant.dbName);

    if (!tenantDataSource || !tenantDataSource.isInitialized) {
      const mainOptions = this.dataSource.options as any;

      tenantDataSource = new DataSource({
        ...mainOptions,
        database: tenant.dbName,
        name: `tenant_${tenant.dbName}`,
        synchronize: true,
        entities: mainOptions.entities, // 👈 CRUCIAL: Hereda todas las entidades del módulo principal (User, Role, Product, Client, etc.)
      });

      await tenantDataSource.initialize();
      TenantMiddleware.tenantDataSources.set(tenant.dbName, tenantDataSource);
    }

    req.tenant = tenant;
    req.tenantDataSource = tenantDataSource;
    req['tenantDatabase'] = tenant.dbName;

    next();
  }
}