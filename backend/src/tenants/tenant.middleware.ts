// src/tenants/tenant.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

declare module 'express-serve-static-core' {
  interface Request {
    tenant?: Tenant;
    tenantDataSource?: DataSource;
    tenantDatabase?: string;
  }
}

// Extender la interfaz Request de Express para tipar el tenant y su DataSource
export interface TenantRequest extends Request {
}

export function getTenantDataSource(request: Request): DataSource {
  if (!request.tenantDataSource) {
    throw new InternalServerErrorException('No se resolvió la base de datos del tenant para esta solicitud.');
  }
  return request.tenantDataSource;
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
    const subdomain = String(
      req.headers['x-tenant-subdomain'] || req.headers['x-tenant-id'] || '',
    ).trim().toLowerCase();

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
        synchronize: false,
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