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
exports.InventoryCountsService = void 0;
var common_1 = require("@nestjs/common");
var inventory_count_entity_1 = require("./entities/inventory-count.entity");
var InventoryCountsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var InventoryCountsService = _classThis = /** @class */ (function () {
        function InventoryCountsService_1(inventoryCountRepository, countItemRepository, productRepository, auditLogRepository) {
            this.inventoryCountRepository = inventoryCountRepository;
            this.countItemRepository = countItemRepository;
            this.productRepository = productRepository;
            this.auditLogRepository = auditLogRepository;
        }
        InventoryCountsService_1.prototype.create = function (createInventoryCountDto, usuario) {
            return __awaiter(this, void 0, void 0, function () {
                var inventoryCount, error_1, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            inventoryCount = this.inventoryCountRepository.create({
                                almacen: createInventoryCountDto.almacen,
                                descripcion: createInventoryCountDto.descripcion,
                                estado: inventory_count_entity_1.ConteoEstado.EN_PROGRESO,
                                items: [],
                            });
                            return [4 /*yield*/, this.inventoryCountRepository.save(inventoryCount)];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_1 = _a.sent();
                            message = error_1 instanceof Error ? error_1.message : 'Error desconocido';
                            throw new common_1.BadRequestException("Error al crear conteo de inventario: ".concat(message));
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        InventoryCountsService_1.prototype.findAll = function (almacen) {
            return __awaiter(this, void 0, void 0, function () {
                var query, error_2, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            query = this.inventoryCountRepository.createQueryBuilder('ic');
                            if (almacen) {
                                query.where('ic.almacen = :almacen', { almacen: almacen });
                            }
                            return [4 /*yield*/, query.orderBy('ic.createdAt', 'DESC').getMany()];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_2 = _a.sent();
                            message = error_2 instanceof Error ? error_2.message : 'Error desconocido';
                            throw new common_1.BadRequestException("Error al buscar conteos: ".concat(message));
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        InventoryCountsService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var inventoryCount, error_3, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.inventoryCountRepository.findOne({
                                    where: { id: id },
                                    relations: ['items'],
                                })];
                        case 1:
                            inventoryCount = _a.sent();
                            if (!inventoryCount) {
                                throw new common_1.NotFoundException("Conteo con id ".concat(id, " no encontrado"));
                            }
                            return [2 /*return*/, inventoryCount];
                        case 2:
                            error_3 = _a.sent();
                            if (error_3 instanceof common_1.NotFoundException) {
                                throw error_3;
                            }
                            message = error_3 instanceof Error ? error_3.message : 'Error desconocido';
                            throw new common_1.BadRequestException("Error al buscar conteo: ".concat(message));
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        InventoryCountsService_1.prototype.addProductToCount = function (conteoId, addCountItemDto) {
            return __awaiter(this, void 0, void 0, function () {
                var inventoryCount, product, existingItem, countItem, savedItem, error_4, message;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 6, , 7]);
                            return [4 /*yield*/, this.findOne(conteoId)];
                        case 1:
                            inventoryCount = _b.sent();
                            if (inventoryCount.estado !== inventory_count_entity_1.ConteoEstado.EN_PROGRESO) {
                                throw new common_1.BadRequestException('Solo se pueden agregar productos a conteos en estado EN_PROGRESO');
                            }
                            return [4 /*yield*/, this.productRepository.findOne({
                                    where: { id: addCountItemDto.productoId },
                                })];
                        case 2:
                            product = _b.sent();
                            if (!product) {
                                throw new common_1.NotFoundException("Producto con id ".concat(addCountItemDto.productoId, " no encontrado"));
                            }
                            return [4 /*yield*/, this.countItemRepository.findOne({
                                    where: {
                                        conteo: { id: conteoId },
                                        productoId: addCountItemDto.productoId,
                                    },
                                })];
                        case 3:
                            existingItem = _b.sent();
                            if (existingItem) {
                                throw new common_1.BadRequestException('Este producto ya está agregado al conteo');
                            }
                            countItem = this.countItemRepository.create({
                                conteo: inventoryCount,
                                productoId: product.id,
                                productoNombre: product.nombre,
                                codigo: product.codigo,
                                cantidadSistema: product.stock,
                                cantidadContada: (_a = addCountItemDto.cantidadContada) !== null && _a !== void 0 ? _a : undefined,
                                precioUnitario: product.precio,
                                unidadMedida: product.unidadMedida || 'Unidad',
                            });
                            return [4 /*yield*/, this.countItemRepository.save(countItem)];
                        case 4:
                            savedItem = _b.sent();
                            inventoryCount.totalProductos = (inventoryCount.totalProductos || 0) + 1;
                            return [4 /*yield*/, this.inventoryCountRepository.save(inventoryCount)];
                        case 5:
                            _b.sent();
                            return [2 /*return*/, savedItem];
                        case 6:
                            error_4 = _b.sent();
                            if (error_4 instanceof common_1.NotFoundException ||
                                error_4 instanceof common_1.BadRequestException) {
                                throw error_4;
                            }
                            message = error_4 instanceof Error ? error_4.message : 'Error desconocido';
                            throw new common_1.BadRequestException("Error al agregar producto al conteo: ".concat(message));
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        InventoryCountsService_1.prototype.updateCountItem = function (conteoId, itemId, updateCountItemDto) {
            return __awaiter(this, void 0, void 0, function () {
                var inventoryCount, countItem, error_5, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            return [4 /*yield*/, this.findOne(conteoId)];
                        case 1:
                            inventoryCount = _a.sent();
                            if (inventoryCount.estado !== inventory_count_entity_1.ConteoEstado.EN_PROGRESO) {
                                throw new common_1.BadRequestException('Solo se pueden actualizar items en conteos EN_PROGRESO');
                            }
                            return [4 /*yield*/, this.countItemRepository.findOne({
                                    where: { id: itemId },
                                })];
                        case 2:
                            countItem = _a.sent();
                            if (!countItem) {
                                throw new common_1.NotFoundException("Item con id ".concat(itemId, " no encontrado"));
                            }
                            countItem.cantidadContada = updateCountItemDto.cantidadContada;
                            return [4 /*yield*/, this.countItemRepository.save(countItem)];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4:
                            error_5 = _a.sent();
                            if (error_5 instanceof common_1.NotFoundException ||
                                error_5 instanceof common_1.BadRequestException) {
                                throw error_5;
                            }
                            message = error_5 instanceof Error ? error_5.message : 'Error desconocido';
                            throw new common_1.BadRequestException("Error al actualizar item del conteo: ".concat(message));
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        InventoryCountsService_1.prototype.publishAdjustments = function (conteoId) {
            return __awaiter(this, void 0, void 0, function () {
                var inventoryCount, totalVariacion, _i, _a, item, diferencia, product, nuevoStock, error_6, message;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 9, , 10]);
                            return [4 /*yield*/, this.findOne(conteoId)];
                        case 1:
                            inventoryCount = _b.sent();
                            if (inventoryCount.estado === inventory_count_entity_1.ConteoEstado.CANCELADO) {
                                throw new common_1.BadRequestException('No se puede publicar un conteo cancelado');
                            }
                            inventoryCount.estado = inventory_count_entity_1.ConteoEstado.AJUSTES_PUBLICADOS;
                            totalVariacion = 0;
                            _i = 0, _a = inventoryCount.items;
                            _b.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 7];
                            item = _a[_i];
                            diferencia = item.diferencia;
                            if (!(diferencia !== 0)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.productRepository.findOne({
                                    where: { id: item.productoId },
                                })];
                        case 3:
                            product = _b.sent();
                            if (!product) return [3 /*break*/, 5];
                            nuevoStock = product.stock + diferencia;
                            product.stock = nuevoStock;
                            return [4 /*yield*/, this.productRepository.save(product)];
                        case 4:
                            _b.sent();
                            _b.label = 5;
                        case 5:
                            totalVariacion += item.costoVariacion;
                            _b.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 2];
                        case 7:
                            inventoryCount.totalVariacion = totalVariacion;
                            return [4 /*yield*/, this.inventoryCountRepository.save(inventoryCount)];
                        case 8: return [2 /*return*/, _b.sent()];
                        case 9:
                            error_6 = _b.sent();
                            if (error_6 instanceof common_1.NotFoundException ||
                                error_6 instanceof common_1.BadRequestException) {
                                throw error_6;
                            }
                            message = error_6 instanceof Error ? error_6.message : 'Error desconocido';
                            throw new common_1.BadRequestException("Error al publicar ajustes: ".concat(message));
                        case 10: return [2 /*return*/];
                    }
                });
            });
        };
        InventoryCountsService_1.prototype.cancelCount = function (conteoId) {
            return __awaiter(this, void 0, void 0, function () {
                var inventoryCount, error_7, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, this.findOne(conteoId)];
                        case 1:
                            inventoryCount = _a.sent();
                            inventoryCount.estado = inventory_count_entity_1.ConteoEstado.CANCELADO;
                            return [4 /*yield*/, this.inventoryCountRepository.save(inventoryCount)];
                        case 2: return [2 /*return*/, _a.sent()];
                        case 3:
                            error_7 = _a.sent();
                            if (error_7 instanceof common_1.NotFoundException) {
                                throw error_7;
                            }
                            message = error_7 instanceof Error ? error_7.message : 'Error desconocido';
                            throw new common_1.BadRequestException("Error al cancelar conteo: ".concat(message));
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        InventoryCountsService_1.prototype.remove = function (id, usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                var conteo, error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            conteo = _a.sent();
                            // Registramos el log de auditoría antes de eliminar
                            return [4 /*yield*/, this.auditLogRepository.save({
                                    accion: 'ELIMINAR_CONTEO_FISICO',
                                    entidadId: id.toString(),
                                    entidadTipo: 'InventoryCount',
                                    usuarioId: usuarioId,
                                    detalles: {
                                        almacen: conteo.almacen,
                                        descripcion: conteo.descripcion,
                                        fechaCreacion: conteo.createdAt,
                                    }
                                })];
                        case 2:
                            // Registramos el log de auditoría antes de eliminar
                            _a.sent();
                            return [4 /*yield*/, this.inventoryCountRepository.delete(id)];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            error_8 = _a.sent();
                            if (error_8 instanceof common_1.NotFoundException)
                                throw error_8;
                            throw new common_1.BadRequestException("Error al eliminar conteo: ".concat(error_8.message));
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return InventoryCountsService_1;
    }());
    __setFunctionName(_classThis, "InventoryCountsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InventoryCountsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InventoryCountsService = _classThis;
}();
exports.InventoryCountsService = InventoryCountsService;
