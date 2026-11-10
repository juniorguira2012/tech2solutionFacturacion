import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      throw new BadRequestException('Falta el identificador del cliente (x-tenant-id)');
    }

    let dbName: string;

    // 💡 Si es localhost genérico o la central sin tenant específico, usamos la de pruebas por defecto
    if (tenantId === 'localhost' || tenantId === 'tech_two_solution_db' || tenantId === 'onered') {
      dbName = 'tech2_prueba_db';
    } else {
      // 🚀 Mapeo dinámico para cualquier tenant (ej: muebleshabitat -> muebleshabitat_db)
      dbName = tenantId.endsWith('_db') ? tenantId : `${tenantId}_db`;
    }

    // Guardamos el nombre de la base de datos en la petición
    req['tenantDatabase'] = dbName;
    next();
  }
}