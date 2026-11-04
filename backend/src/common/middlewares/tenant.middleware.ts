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

    // 💡 Si estamos en entorno local de desarrollo, usamos tu BD de pruebas local
    if (process.env.NODE_ENV !== 'production' || tenantId === 'localhost' || tenantId === 'tech_two_solution_db') {
      dbName = 'tech2_prueba_db'; // <--- Tu base de datos local actual
    } else {
      // 🚀 En producción, mapea dinámicamente el tenant a su base de datos correspondiente (ej: muebles_habitat -> muebles_habitat_db)
      // Si el x-tenant-id ya viene como "muebles_habitat_db", lo respetamos, de lo contrario le añadimos "_db"
      dbName = tenantId.endsWith('_db') ? tenantId : `${tenantId}_db`;
    }

    // Guardamos el nombre de la base de datos en la petición para que los servicios la lean
    req['tenantDatabase'] = dbName;
    next();
  }
}