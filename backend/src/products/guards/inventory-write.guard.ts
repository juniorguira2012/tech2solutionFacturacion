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

    console.log("🚀 [GUARD] ¡Entrando a la validación de inventario en producción!");
    console.log("🚀 [GUARD] Header Authorization presente:", !!request.headers.authorization);
    
    let user = request.user;

    // 🔍 Descodificamos el Token manualmente si no viene cargado por Passport
    if (!user && request.headers.authorization) {
      try {
        const authHeader = request.headers.authorization;
        const token = authHeader.split(' ')[1]; 
        
        if (token) {
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
      console.log("🚀 [GUARD] Datos del usuario en el token:", user);

      // 💡 CORRECCIÓN 1: Extraer el rol de forma segura
      const userRole = user.role || (typeof user.rol === 'string' ? user.rol : user.rol?.nombre);
      
      console.log("🚀 [GUARD] Rol final detectado:", userRole);

      // 💡 CORRECCIÓN 2: Permitir acceso directo a roles autorizados a escribir en inventario
      const normalizedRole = String(userRole).toLowerCase();
      if (
        normalizedRole === 'admin' || 
        normalizedRole === 'prueba' || 
        normalizedRole === 'almacenista' || 
        normalizedRole === 'almacen'
      ) {
        console.log(`✅ [GUARD] Acceso concedido por Rol Autorizado: ${userRole}`);
        return true;
      }

      // Buscamos la configuración de permisos complejos dentro del JSONB (si existiera en el token)
      const config = user.rol?.config?.modules?.inventario 
                  || user.rol?.config?.inventario 
                  || user.config?.modules?.inventario
                  || user.config?.inventario;

      if (config) {
        const method = request.method; // 'POST', 'PATCH', 'DELETE'
        console.log(`🔍 [GUARD] Evaluando permisos específicos de módulo para método: ${method}`);

        if (method === 'POST' && config.create) return true;
        if (method === 'PATCH' && config.edit) return true;
        if (method === 'DELETE' && config.delete) return true;
      }
    }

    // 🔄 VALIDACIÓN 2 (BACKUP): Lógica por si envías headers estáticos desde React
    const roleHeader = String(request.headers['x-user-role']).toLowerCase();
    const permissionHeader = request.headers['x-inventory-permission'];
    
    if (
      roleHeader === 'admin' || 
      roleHeader === 'almacen' || 
      roleHeader === 'almacenista' || 
      roleHeader === 'prueba' || 
      permissionHeader === 'full'
    ) {
      console.log("✅ [GUARD] Acceso concedido mediante Headers de Backup");
      return true;
    }

    // Si llegó hasta aquí, denegamos acceso
    console.log("❌ [GUARD] Acceso Denegado. No cumple ninguna condición.");
    throw new ForbiddenException(
      'No tienes permiso para modificar el inventario',
    );
  }
}