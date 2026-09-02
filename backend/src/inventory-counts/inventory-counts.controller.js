"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryCountsController = exports.UpdateCountItemDto = exports.AddCountItemDto = exports.CreateInventoryCountDto = void 0;
var common_1 = require("@nestjs/common");
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
// DTOs
var CreateInventoryCountDto = function () {
    var _a;
    var _almacen_decorators;
    var _almacen_initializers = [];
    var _almacen_extraInitializers = [];
    var _descripcion_decorators;
    var _descripcion_initializers = [];
    var _descripcion_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateInventoryCountDto() {
                this.almacen = __runInitializers(this, _almacen_initializers, void 0);
                this.descripcion = (__runInitializers(this, _almacen_extraInitializers), __runInitializers(this, _descripcion_initializers, void 0));
                __runInitializers(this, _descripcion_extraInitializers);
            }
            return CreateInventoryCountDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _almacen_decorators = [(0, class_validator_1.IsString)()];
            _descripcion_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _almacen_decorators, { kind: "field", name: "almacen", static: false, private: false, access: { has: function (obj) { return "almacen" in obj; }, get: function (obj) { return obj.almacen; }, set: function (obj, value) { obj.almacen = value; } }, metadata: _metadata }, _almacen_initializers, _almacen_extraInitializers);
            __esDecorate(null, null, _descripcion_decorators, { kind: "field", name: "descripcion", static: false, private: false, access: { has: function (obj) { return "descripcion" in obj; }, get: function (obj) { return obj.descripcion; }, set: function (obj, value) { obj.descripcion = value; } }, metadata: _metadata }, _descripcion_initializers, _descripcion_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateInventoryCountDto = CreateInventoryCountDto;
var AddCountItemDto = function () {
    var _a;
    var _productoId_decorators;
    var _productoId_initializers = [];
    var _productoId_extraInitializers = [];
    var _cantidadContada_decorators;
    var _cantidadContada_initializers = [];
    var _cantidadContada_extraInitializers = [];
    return _a = /** @class */ (function () {
            function AddCountItemDto() {
                this.productoId = __runInitializers(this, _productoId_initializers, void 0);
                this.cantidadContada = (__runInitializers(this, _productoId_extraInitializers), __runInitializers(this, _cantidadContada_initializers, void 0));
                __runInitializers(this, _cantidadContada_extraInitializers);
            }
            return AddCountItemDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productoId_decorators = [(0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsNumber)()];
            _cantidadContada_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _productoId_decorators, { kind: "field", name: "productoId", static: false, private: false, access: { has: function (obj) { return "productoId" in obj; }, get: function (obj) { return obj.productoId; }, set: function (obj, value) { obj.productoId = value; } }, metadata: _metadata }, _productoId_initializers, _productoId_extraInitializers);
            __esDecorate(null, null, _cantidadContada_decorators, { kind: "field", name: "cantidadContada", static: false, private: false, access: { has: function (obj) { return "cantidadContada" in obj; }, get: function (obj) { return obj.cantidadContada; }, set: function (obj, value) { obj.cantidadContada = value; } }, metadata: _metadata }, _cantidadContada_initializers, _cantidadContada_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.AddCountItemDto = AddCountItemDto;
var UpdateCountItemDto = function () {
    var _a;
    var _cantidadContada_decorators;
    var _cantidadContada_initializers = [];
    var _cantidadContada_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateCountItemDto() {
                this.cantidadContada = __runInitializers(this, _cantidadContada_initializers, void 0);
                __runInitializers(this, _cantidadContada_extraInitializers);
            }
            return UpdateCountItemDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _cantidadContada_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            __esDecorate(null, null, _cantidadContada_decorators, { kind: "field", name: "cantidadContada", static: false, private: false, access: { has: function (obj) { return "cantidadContada" in obj; }, get: function (obj) { return obj.cantidadContada; }, set: function (obj, value) { obj.cantidadContada = value; } }, metadata: _metadata }, _cantidadContada_initializers, _cantidadContada_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateCountItemDto = UpdateCountItemDto;
// Guard placeholder (usuario debe crear este archivo)
// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// @Injectable()
// export class InventoryWriteGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest();
//     const userRole = request.headers['x-user-role'];
//     const permission = request.headers['x-inventory-permission'];
//     return permission === 'full' || permission === 'view';
//   }
// }
var InventoryCountsController = function () {
    var _classDecorators = [(0, common_1.Controller)('inventory-counts')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _createInventoryCount_decorators;
    var _listInventoryCounts_decorators;
    var _getInventoryCount_decorators;
    var _addCountItem_decorators;
    var _updateCountItem_decorators;
    var _publishInventoryCount_decorators;
    var _cancelInventoryCount_decorators;
    var _removeInventoryCount_decorators;
    var InventoryCountsController = _classThis = /** @class */ (function () {
        function InventoryCountsController_1(service) {
            this.service = (__runInitializers(this, _instanceExtraInitializers), service);
        }
        /**
         * Crear nuevo conteo de inventario
         * Solo usuarios con permiso 'full' pueden crear
         */
        InventoryCountsController_1.prototype.createInventoryCount = function (dto, userId, userRole, permission) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (permission !== 'full') {
                        throw new common_1.UnauthorizedException('Solo usuarios con permiso "full" pueden crear conteos');
                    }
                    if (!userId) { // Verificamos que el userId exista
                        throw new common_1.UnauthorizedException('Usuario no identificado');
                    }
                    return [2 /*return*/, this.service.create(__assign({}, dto), { id: userId, rol: userRole })];
                });
            });
        };
        /**
         * Listar conteos de inventario
         * Soporta filtrado por almacén
         */
        InventoryCountsController_1.prototype.listInventoryCounts = function (almacen, permission) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!permission || (permission !== 'full' && permission !== 'view')) {
                        throw new common_1.UnauthorizedException('No tienes permiso para acceder a los conteos');
                    }
                    return [2 /*return*/, this.service.findAll(almacen)];
                });
            });
        };
        /**
         * Obtener detalle de un conteo
         */
        InventoryCountsController_1.prototype.getInventoryCount = function (id, permission) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!permission || (permission !== 'full' && permission !== 'view')) {
                        throw new common_1.UnauthorizedException('No tienes permiso para acceder a este conteo');
                    }
                    return [2 /*return*/, this.service.findOne(Number(id))];
                });
            });
        };
        /**
         * Agregar producto al conteo
         * Solo usuarios con permiso 'full' pueden agregar items
         */
        InventoryCountsController_1.prototype.addCountItem = function (id, dto, userId, permission) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (permission !== 'full') {
                        throw new common_1.UnauthorizedException('Solo usuarios con permiso "full" pueden agregar items al conteo');
                    }
                    if (!userId) { // Verificamos que el userId exista
                        throw new common_1.UnauthorizedException('Usuario no identificado');
                    }
                    return [2 /*return*/, this.service.addProductToCount(Number(id), dto)];
                });
            });
        };
        /**
         * Actualizar cantidad contada de un item
         * Solo usuarios con permiso 'full' pueden actualizar
         */
        InventoryCountsController_1.prototype.updateCountItem = function (id, itemId, dto, userId, permission) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (permission !== 'full') {
                        throw new common_1.UnauthorizedException('Solo usuarios con permiso "full" pueden actualizar items');
                    }
                    if (!userId) { // Verificamos que el userId exista
                        throw new common_1.UnauthorizedException('Usuario no identificado');
                    }
                    if (typeof dto.cantidadContada !== 'number' || dto.cantidadContada < 0) {
                        throw new common_1.BadRequestException('La cantidad debe ser un número no negativo');
                    }
                    return [2 /*return*/, this.service.updateCountItem(Number(id), Number(itemId), dto)];
                });
            });
        };
        /**
         * Publicar ajustes del conteo
         * Solo usuarios con permiso 'full' pueden publicar
         */
        InventoryCountsController_1.prototype.publishInventoryCount = function (id, userId, permission) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (permission !== 'full') {
                        throw new common_1.UnauthorizedException('Solo usuarios con permiso "full" pueden publicar conteos');
                    }
                    if (!userId) { // Verificamos que el userId exista
                        throw new common_1.UnauthorizedException('Usuario no identificado');
                    }
                    return [2 /*return*/, this.service.publishAdjustments(Number(id))];
                });
            });
        };
        /**
         * Cancelar conteo
         * Solo usuarios con permiso 'full' pueden cancelar
         */
        InventoryCountsController_1.prototype.cancelInventoryCount = function (id, userId, permission) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (permission !== 'full') {
                        throw new common_1.UnauthorizedException('Solo usuarios con permiso "full" pueden cancelar conteos');
                    }
                    if (!userId) { // Verificamos que el userId exista
                        throw new common_1.UnauthorizedException('Usuario no identificado');
                    }
                    return [2 /*return*/, this.service.cancelCount(Number(id))];
                });
            });
        };
        /**
         * Eliminar un conteo físico
         */
        InventoryCountsController_1.prototype.removeInventoryCount = function (id, userId, userRole, permission) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (userRole !== 'admin' && permission !== 'full') {
                        throw new common_1.UnauthorizedException('Solo administradores pueden eliminar auditorías físicas');
                    }
                    return [2 /*return*/, this.service.remove(Number(id), userId)];
                });
            });
        };
        return InventoryCountsController_1;
    }());
    __setFunctionName(_classThis, "InventoryCountsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createInventoryCount_decorators = [(0, common_1.Post)()];
        _listInventoryCounts_decorators = [(0, common_1.Get)()];
        _getInventoryCount_decorators = [(0, common_1.Get)(':id')];
        _addCountItem_decorators = [(0, common_1.Post)(':id/items'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
        _updateCountItem_decorators = [(0, common_1.Patch)(':id/items/:itemId')];
        _publishInventoryCount_decorators = [(0, common_1.Post)(':id/publish'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _cancelInventoryCount_decorators = [(0, common_1.Patch)(':id/cancel')];
        _removeInventoryCount_decorators = [(0, common_1.Delete)(':id'), (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT)];
        __esDecorate(_classThis, null, _createInventoryCount_decorators, { kind: "method", name: "createInventoryCount", static: false, private: false, access: { has: function (obj) { return "createInventoryCount" in obj; }, get: function (obj) { return obj.createInventoryCount; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listInventoryCounts_decorators, { kind: "method", name: "listInventoryCounts", static: false, private: false, access: { has: function (obj) { return "listInventoryCounts" in obj; }, get: function (obj) { return obj.listInventoryCounts; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getInventoryCount_decorators, { kind: "method", name: "getInventoryCount", static: false, private: false, access: { has: function (obj) { return "getInventoryCount" in obj; }, get: function (obj) { return obj.getInventoryCount; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addCountItem_decorators, { kind: "method", name: "addCountItem", static: false, private: false, access: { has: function (obj) { return "addCountItem" in obj; }, get: function (obj) { return obj.addCountItem; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateCountItem_decorators, { kind: "method", name: "updateCountItem", static: false, private: false, access: { has: function (obj) { return "updateCountItem" in obj; }, get: function (obj) { return obj.updateCountItem; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _publishInventoryCount_decorators, { kind: "method", name: "publishInventoryCount", static: false, private: false, access: { has: function (obj) { return "publishInventoryCount" in obj; }, get: function (obj) { return obj.publishInventoryCount; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancelInventoryCount_decorators, { kind: "method", name: "cancelInventoryCount", static: false, private: false, access: { has: function (obj) { return "cancelInventoryCount" in obj; }, get: function (obj) { return obj.cancelInventoryCount; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _removeInventoryCount_decorators, { kind: "method", name: "removeInventoryCount", static: false, private: false, access: { has: function (obj) { return "removeInventoryCount" in obj; }, get: function (obj) { return obj.removeInventoryCount; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InventoryCountsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InventoryCountsController = _classThis;
}();
exports.InventoryCountsController = InventoryCountsController;
