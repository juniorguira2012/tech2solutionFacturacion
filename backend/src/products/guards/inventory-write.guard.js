"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryWriteGuard = void 0;
var common_1 = require("@nestjs/common");
var InventoryWriteGuard = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var InventoryWriteGuard = _classThis = /** @class */ (function () {
        function InventoryWriteGuard_1() {
        }
        InventoryWriteGuard_1.prototype.canActivate = function (context) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var request = context.switchToHttp().getRequest();
            console.log("🚀 [GUARD] ¡Entrando a la validación de inventario en producción!");
            console.log("🚀 [GUARD] Header Authorization presente:", !!request.headers.authorization);
            var user = request.user;
            // 🔍 Descodificamos el Token manualmente si no viene cargado por Passport
            if (!user && request.headers.authorization) {
                try {
                    var authHeader = request.headers.authorization;
                    var token = authHeader.split(' ')[1];
                    if (token) {
                        var base64Payload = token.split('.')[1];
                        var payloadBuffer = Buffer.from(base64Payload, 'base64');
                        user = JSON.parse(payloadBuffer.toString());
                    }
                }
                catch (e) {
                    console.error('Error al descodificar el token manualmente en el Guard:', e);
                }
            }
            // 🛡️ VALIDACIÓN 1: Evaluar los permisos mediante los datos reales del Token
            if (user) {
                console.log("🚀 [GUARD] Datos del usuario en el token:", user);
                // 💡 CORRECCIÓN 1: Extraer el rol de forma segura
                var userRole = user.role || (typeof user.rol === 'string' ? user.rol : (_a = user.rol) === null || _a === void 0 ? void 0 : _a.nombre);
                console.log("🚀 [GUARD] Rol final detectado:", userRole);
                // 💡 CORRECCIÓN 2: Permitir acceso directo a roles autorizados a escribir en inventario
                var normalizedRole = String(userRole).toLowerCase();
                if (normalizedRole === 'admin' ||
                    normalizedRole === 'prueba' ||
                    normalizedRole === 'almacenista' ||
                    normalizedRole === 'almacen') {
                    console.log("\u2705 [GUARD] Acceso concedido por Rol Autorizado: ".concat(userRole));
                    return true;
                }
                // Buscamos la configuración de permisos complejos dentro del JSONB (si existiera en el token)
                var config = ((_d = (_c = (_b = user.rol) === null || _b === void 0 ? void 0 : _b.config) === null || _c === void 0 ? void 0 : _c.modules) === null || _d === void 0 ? void 0 : _d.inventario)
                    || ((_f = (_e = user.rol) === null || _e === void 0 ? void 0 : _e.config) === null || _f === void 0 ? void 0 : _f.inventario)
                    || ((_h = (_g = user.config) === null || _g === void 0 ? void 0 : _g.modules) === null || _h === void 0 ? void 0 : _h.inventario)
                    || ((_j = user.config) === null || _j === void 0 ? void 0 : _j.inventario);
                if (config) {
                    var method = request.method; // 'POST', 'PATCH', 'DELETE'
                    console.log("\uD83D\uDD0D [GUARD] Evaluando permisos espec\u00EDficos de m\u00F3dulo para m\u00E9todo: ".concat(method));
                    if (method === 'POST' && config.create)
                        return true;
                    if (method === 'PATCH' && config.edit)
                        return true;
                    if (method === 'DELETE' && config.delete)
                        return true;
                }
            }
            // 🔄 VALIDACIÓN 2 (BACKUP): Lógica por si envías headers estáticos desde React
            var roleHeader = String(request.headers['x-user-role']).toLowerCase();
            var permissionHeader = request.headers['x-inventory-permission'];
            if (roleHeader === 'admin' ||
                roleHeader === 'almacen' ||
                roleHeader === 'almacenista' ||
                roleHeader === 'prueba' ||
                permissionHeader === 'full') {
                console.log("✅ [GUARD] Acceso concedido mediante Headers de Backup");
                return true;
            }
            // Si llegó hasta aquí, denegamos acceso
            console.log("❌ [GUARD] Acceso Denegado. No cumple ninguna condición.");
            throw new common_1.ForbiddenException('No tienes permiso para modificar el inventario');
        };
        return InventoryWriteGuard_1;
    }());
    __setFunctionName(_classThis, "InventoryWriteGuard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InventoryWriteGuard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InventoryWriteGuard = _classThis;
}();
exports.InventoryWriteGuard = InventoryWriteGuard;
