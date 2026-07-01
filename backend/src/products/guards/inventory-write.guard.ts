import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class InventoryWriteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    let user = request.user;

    // 🔍 SI NOTIENES JWT-AUTH-GUARD: Descodificamos el Token manualmente desde el Header Authorization
    if (!user && request.headers.authorization) {
      try {
        const authHeader = request.headers.authorization;
        const token = authHeader.split(' ')[1]; // Separar el 'Bearer' del string del token
        
        if (token) {
          // Descodificación nativa del payload del JWT (Base64)
          const base64Payload = token.split('.')[1];
          const payloadBuffer = Buffer.from(base64Payload, 'base64');
          user = JSON.parse(payloadBuffer.toString());
        }
      } catch (e) {
        console.error('Error al descodificar el token manualmente en el Guard:', e);
      }
    }

    // 🛡️ VALIDACIÓN 1: Evaluar los permisos mediante los datos reales del Token
    if (user) {
      const userRole = user.role || user.rol?.nombre;
      
      // Si es administrador, pasa directo sin mirar atrás
      if (userRole === 'admin' || String(userRole).toLowerCase() === 'admin') {
        return true;
      }

      // Buscamos la configuración de permisos dentro del JSONB (manejando si viene en modules o directo)
      const config = user.rol?.config?.modules?.inventario 
                  || user.rol?.config?.inventario 
                  || user.config?.modules?.inventario
                  || user.config?.inventario;

      if (config) {
        const method = request.method; // 'POST', 'PATCH', 'DELETE'

        if (method === 'POST' && config.create) return true;
        if (method === 'PATCH' && config.edit) return true;
        if (method === 'DELETE' && config.delete) return true;
      }
    }

    // 🔄 VALIDACIÓN 2 (BACKUP): Tu lógica antigua por si tu frontend envía headers estáticos
    const roleHeader = request.headers['x-user-role'];
    const permissionHeader = request.headers['x-inventory-permission'];
    
    if (
      roleHeader === 'admin' || 
      roleHeader === 'almacen' || 
      permissionHeader === 'full'
    ) {
      return true;
    }

    // Si llegó hasta aquí, el acceso queda totalmente denegado
    throw new ForbiddenException(
      'No tienes permiso para modificar el inventario',
    );
  }
}