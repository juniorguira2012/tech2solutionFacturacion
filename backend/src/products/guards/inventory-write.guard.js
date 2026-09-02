"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryWriteGuard = void 0;
const common_1 = require("@nestjs/common");
let InventoryWriteGuard = class InventoryWriteGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        console.log("🚀 [GUARD] ¡Entrando a la validación de inventario en producción!");
        console.log("🚀 [GUARD] Header Authorization presente:", !!request.headers.authorization);
        let user = request.user;
        if (!user && request.headers.authorization) {
            try {
                const authHeader = request.headers.authorization;
                const token = authHeader.split(' ')[1];
                if (token) {
                    const base64Payload = token.split('.')[1];
                    const payloadBuffer = Buffer.from(base64Payload, 'base64');
                    user = JSON.parse(payloadBuffer.toString());
                }
            }
            catch (e) {
                console.error('Error al descodificar el token manualmente en el Guard:', e);
            }
        }
        if (user) {
            console.log("🚀 [GUARD] Datos del usuario en el token:", user);
            const userRole = user.role || (typeof user.rol === 'string' ? user.rol : user.rol?.nombre);
            console.log("🚀 [GUARD] Rol final detectado:", userRole);
            const normalizedRole = String(userRole).toLowerCase();
            if (normalizedRole === 'admin' ||
                normalizedRole === 'prueba' ||
                normalizedRole === 'almacenista' ||
                normalizedRole === 'almacen') {
                console.log(`✅ [GUARD] Acceso concedido por Rol Autorizado: ${userRole}`);
                return true;
            }
            const config = user.rol?.config?.modules?.inventario
                || user.rol?.config?.inventario
                || user.config?.modules?.inventario
                || user.config?.inventario;
            if (config) {
                const method = request.method;
                console.log(`🔍 [GUARD] Evaluando permisos específicos de módulo para método: ${method}`);
                if (method === 'POST' && config.create)
                    return true;
                if (method === 'PATCH' && config.edit)
                    return true;
                if (method === 'DELETE' && config.delete)
                    return true;
            }
        }
        const roleHeader = String(request.headers['x-user-role']).toLowerCase();
        const permissionHeader = request.headers['x-inventory-permission'];
        if (roleHeader === 'admin' ||
            roleHeader === 'almacen' ||
            roleHeader === 'almacenista' ||
            roleHeader === 'prueba' ||
            permissionHeader === 'full') {
            console.log("✅ [GUARD] Acceso concedido mediante Headers de Backup");
            return true;
        }
        console.log("❌ [GUARD] Acceso Denegado. No cumple ninguna condición.");
        throw new common_1.ForbiddenException('No tienes permiso para modificar el inventario');
    }
};
exports.InventoryWriteGuard = InventoryWriteGuard;
exports.InventoryWriteGuard = InventoryWriteGuard = __decorate([
    (0, common_1.Injectable)()
], InventoryWriteGuard);
//# sourceMappingURL=inventory-write.guard.js.map