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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementsService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("typeorm");
var movement_entity_1 = require("./entities/movement.entity");
var product_entity_1 = require("../products/entities/product.entity");
var product_warehouse_stock_entity_1 = require("../products/entities/product-warehouse-stock.entity");
var product_serial_entity_1 = require("../products/entities/product-serial.entity");
var inventory_batch_entity_1 = require("./entities/inventory-batch.entity");
var technician_entity_1 = require("./entities/technician.entity");
var MovementsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var MovementsService = _classThis = /** @class */ (function () {
        function MovementsService_1(movementRepository, productRepository, technicianRepository, inventoryBatchRepository, dataSource) {
            this.movementRepository = movementRepository;
            this.productRepository = productRepository;
            this.technicianRepository = technicianRepository;
            this.inventoryBatchRepository = inventoryBatchRepository;
            this.dataSource = dataSource;
        }
        MovementsService_1.prototype.findTechnicians = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.technicianRepository.find({
                            where: { isActive: true },
                            order: { nombre: 'ASC' },
                        })];
                });
            });
        };
        MovementsService_1.prototype.createTechnician = function (payload) {
            return __awaiter(this, void 0, void 0, function () {
                var nombre, existente, technician;
                var _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            nombre = (_a = payload.nombre) === null || _a === void 0 ? void 0 : _a.trim();
                            if (!nombre) {
                                throw new common_1.BadRequestException('El nombre del técnico es obligatorio');
                            }
                            return [4 /*yield*/, this.technicianRepository.findOne({ where: { nombre: nombre } })];
                        case 1:
                            existente = _f.sent();
                            if (existente) {
                                if (!existente.isActive) {
                                    existente.isActive = true;
                                    existente.telefono = ((_b = payload.telefono) === null || _b === void 0 ? void 0 : _b.trim()) || existente.telefono;
                                    existente.email = ((_c = payload.email) === null || _c === void 0 ? void 0 : _c.trim()) || existente.email;
                                    return [2 /*return*/, this.technicianRepository.save(existente)];
                                }
                                return [2 /*return*/, existente];
                            }
                            technician = this.technicianRepository.create({
                                nombre: nombre,
                                telefono: ((_d = payload.telefono) === null || _d === void 0 ? void 0 : _d.trim()) || undefined,
                                email: ((_e = payload.email) === null || _e === void 0 ? void 0 : _e.trim()) || undefined,
                            });
                            return [2 /*return*/, this.technicianRepository.save(technician)];
                    }
                });
            });
        };
        MovementsService_1.prototype.updateTechnician = function (id, payload) {
            return __awaiter(this, void 0, void 0, function () {
                var technician, nombre, duplicado;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.technicianRepository.findOne({ where: { id: id } })];
                        case 1:
                            technician = _d.sent();
                            if (!technician) {
                                throw new common_1.NotFoundException("T\u00E9cnico ID ".concat(id, " no encontrado"));
                            }
                            nombre = (_a = payload.nombre) === null || _a === void 0 ? void 0 : _a.trim();
                            if (!nombre) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.technicianRepository.findOne({
                                    where: { nombre: nombre, id: (0, typeorm_1.Not)(id) },
                                })];
                        case 2:
                            duplicado = _d.sent();
                            if (duplicado) {
                                throw new common_1.BadRequestException('Ya existe otro técnico con ese nombre');
                            }
                            technician.nombre = nombre;
                            _d.label = 3;
                        case 3:
                            if (payload.telefono !== undefined)
                                technician.telefono = ((_b = payload.telefono) === null || _b === void 0 ? void 0 : _b.trim()) || undefined;
                            if (payload.email !== undefined)
                                technician.email = ((_c = payload.email) === null || _c === void 0 ? void 0 : _c.trim()) || undefined;
                            if (payload.isActive !== undefined)
                                technician.isActive = Boolean(payload.isActive);
                            return [2 /*return*/, this.technicianRepository.save(technician)];
                    }
                });
            });
        };
        MovementsService_1.prototype.deleteTechnician = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var technician;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.technicianRepository.findOne({ where: { id: id } })];
                        case 1:
                            technician = _a.sent();
                            if (!technician) {
                                throw new common_1.NotFoundException("T\u00E9cnico ID ".concat(id, " no encontrado"));
                            }
                            technician.isActive = false;
                            return [2 /*return*/, this.technicianRepository.save(technician)];
                    }
                });
            });
        };
        MovementsService_1.prototype.resolveTechnician = function (manager, technicianId, technicianName) {
            return __awaiter(this, void 0, void 0, function () {
                var technician, nombre, existente, nuevo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!technicianId) return [3 /*break*/, 2];
                            return [4 /*yield*/, manager.findOne(technician_entity_1.Technician, { where: { id: Number(technicianId) } })];
                        case 1:
                            technician = _a.sent();
                            if (!technician)
                                throw new common_1.NotFoundException("T\u00E9cnico ID ".concat(technicianId, " no encontrado"));
                            return [2 /*return*/, technician];
                        case 2:
                            nombre = technicianName === null || technicianName === void 0 ? void 0 : technicianName.trim();
                            if (!nombre)
                                return [2 /*return*/, null];
                            return [4 /*yield*/, manager.findOne(technician_entity_1.Technician, { where: { nombre: nombre } })];
                        case 3:
                            existente = _a.sent();
                            if (existente)
                                return [2 /*return*/, existente];
                            nuevo = manager.create(technician_entity_1.Technician, { nombre: nombre });
                            return [2 /*return*/, manager.save(technician_entity_1.Technician, nuevo)];
                    }
                });
            });
        };
        MovementsService_1.prototype.updateWarehouseStock = function (manager_1, productoId_1, almacen_1, cantidad_1) {
            return __awaiter(this, arguments, void 0, function (manager, productoId, almacen, cantidad, isAbsolute) {
                var nombreAlmacen, idProducto, cantidadNueva, existeStock, stockInicial, nuevoStockEntry, nuevaCantidadCalculada;
                if (isAbsolute === void 0) { isAbsolute = false; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!almacen)
                                return [2 /*return*/];
                            nombreAlmacen = almacen.trim();
                            idProducto = Number(productoId);
                            cantidadNueva = Number(cantidad);
                            return [4 /*yield*/, manager.findOne(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                                    where: { productoId: idProducto, almacen: nombreAlmacen },
                                })];
                        case 1:
                            existeStock = _a.sent();
                            if (!!existeStock) return [3 /*break*/, 3];
                            stockInicial = isAbsolute ? cantidadNueva : (cantidadNueva < 0 ? 0 : cantidadNueva);
                            nuevoStockEntry = manager.create(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                                productoId: idProducto,
                                almacen: nombreAlmacen,
                                cantidad: stockInicial,
                            });
                            return [4 /*yield*/, manager.save(product_warehouse_stock_entity_1.ProductWarehouseStock, nuevoStockEntry)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            nuevaCantidadCalculada = isAbsolute
                                ? cantidadNueva
                                : Number(existeStock.cantidad) + cantidadNueva;
                            return [4 /*yield*/, manager.update(product_warehouse_stock_entity_1.ProductWarehouseStock, { productoId: idProducto, almacen: nombreAlmacen }, { cantidad: nuevaCantidadCalculada })];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        MovementsService_1.prototype.generateAndSaveBatch = function (manager, productoId, cantidad, almacen, providedBatchNumber) {
            return __awaiter(this, void 0, void 0, function () {
                var batchNumber, expiryDate, batchEntry;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            batchNumber = providedBatchNumber || "LOTE-".concat(new Date().getTime(), "-").concat(Math.floor(Math.random() * 1000));
                            expiryDate = new Date();
                            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                            batchEntry = manager.create(inventory_batch_entity_1.InventoryBatch, {
                                productoId: productoId,
                                numeroLote: batchNumber,
                                cantidad: cantidad,
                                almacen: almacen,
                                fechaVencimiento: expiryDate,
                            });
                            return [4 /*yield*/, manager.save(inventory_batch_entity_1.InventoryBatch, batchEntry)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, batchNumber];
                    }
                });
            });
        };
        MovementsService_1.prototype.ensureDetailedStockInitialized = function (manager, producto) {
            return __awaiter(this, void 0, void 0, function () {
                var count, entry;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, manager.count(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                                where: { productoId: producto.id },
                            })];
                        case 1:
                            count = _a.sent();
                            if (!(count === 0 && Number(producto.stock) > 0 && producto.almacen)) return [3 /*break*/, 3];
                            entry = manager.create(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                                productoId: producto.id,
                                almacen: producto.almacen,
                                cantidad: producto.stock,
                            });
                            return [4 /*yield*/, manager.save(product_warehouse_stock_entity_1.ProductWarehouseStock, entry)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        MovementsService_1.prototype.transferBulk = function (transferData) {
            return __awaiter(this, void 0, void 0, function () {
                var productoId, almacenOrigen, almacenDestino, cantidad, nota, usuarioId, queryRunner, producto, cantidadNumerica, stockOrigen, stockDisponibleOrigen, logSalida, logEntrada, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            productoId = transferData.productoId, almacenOrigen = transferData.almacenOrigen, almacenDestino = transferData.almacenDestino, cantidad = transferData.cantidad, nota = transferData.nota, usuarioId = transferData.usuarioId;
                            if (almacenOrigen === almacenDestino) {
                                throw new common_1.BadRequestException('El almacén de origen y destino no pueden ser iguales.');
                            }
                            queryRunner = this.dataSource.createQueryRunner();
                            return [4 /*yield*/, queryRunner.connect()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, queryRunner.startTransaction()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 12, 14, 16]);
                            return [4 /*yield*/, queryRunner.manager.findOne(product_entity_1.Product, { where: { id: productoId } })];
                        case 4:
                            producto = _a.sent();
                            if (!producto) {
                                throw new common_1.NotFoundException("Producto ID ".concat(productoId, " no encontrado"));
                            }
                            return [4 /*yield*/, this.ensureDetailedStockInitialized(queryRunner.manager, producto)];
                        case 5:
                            _a.sent();
                            cantidadNumerica = Number(cantidad);
                            return [4 /*yield*/, queryRunner.manager.findOne(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                                    where: { productoId: producto.id, almacen: almacenOrigen.trim() }
                                })];
                        case 6:
                            stockOrigen = _a.sent();
                            stockDisponibleOrigen = stockOrigen ? Number(stockOrigen.cantidad) : 0;
                            if (stockDisponibleOrigen < cantidadNumerica) {
                                throw new common_1.BadRequestException("Stock insuficiente en ".concat(almacenOrigen, " para ").concat(producto.nombre, ". Disponible: ").concat(stockDisponibleOrigen, ", Requerido: ").concat(cantidadNumerica));
                            }
                            return [4 /*yield*/, this.updateWarehouseStock(queryRunner.manager, productoId, almacenOrigen, -cantidadNumerica)];
                        case 7:
                            _a.sent();
                            return [4 /*yield*/, this.updateWarehouseStock(queryRunner.manager, productoId, almacenDestino, cantidadNumerica)];
                        case 8:
                            _a.sent();
                            logSalida = queryRunner.manager.create(movement_entity_1.Movement, {
                                producto: producto,
                                productoId: producto.id,
                                tipo: 'SALIDA',
                                cantidad: cantidadNumerica,
                                nuevoStock: Number(producto.stock),
                                nota: "TRANSFERENCIA (ORIGEN: ".concat(almacenOrigen, " -> DESTINO: ").concat(almacenDestino, ") | ").concat(nota),
                                almacenOrigen: almacenOrigen,
                                almacenDestino: almacenDestino,
                                usuarioId: usuarioId ? String(usuarioId) : undefined
                            });
                            return [4 /*yield*/, queryRunner.manager.save(movement_entity_1.Movement, logSalida)];
                        case 9:
                            _a.sent();
                            logEntrada = queryRunner.manager.create(movement_entity_1.Movement, {
                                producto: producto,
                                productoId: producto.id,
                                tipo: 'ENTRADA',
                                cantidad: cantidadNumerica,
                                nuevoStock: Number(producto.stock),
                                nota: "TRANSFERENCIA (RECIBIDO DESDE: ".concat(almacenOrigen, ") | ").concat(nota),
                                almacenOrigen: almacenOrigen,
                                almacenDestino: almacenDestino,
                                usuarioId: usuarioId ? String(usuarioId) : undefined
                            });
                            return [4 /*yield*/, queryRunner.manager.save(movement_entity_1.Movement, logEntrada)];
                        case 10:
                            _a.sent();
                            return [4 /*yield*/, queryRunner.commitTransaction()];
                        case 11:
                            _a.sent();
                            return [2 /*return*/, { message: 'Transferencia procesada con éxito', productoId: productoId, cantidad: cantidadNumerica }];
                        case 12:
                            err_1 = _a.sent();
                            return [4 /*yield*/, queryRunner.rollbackTransaction()];
                        case 13:
                            _a.sent();
                            throw err_1;
                        case 14: return [4 /*yield*/, queryRunner.release()];
                        case 15:
                            _a.sent();
                            return [7 /*endfinally*/];
                        case 16: return [2 /*return*/];
                    }
                });
            });
        };
        MovementsService_1.prototype.create = function (createMovementDto) {
            return __awaiter(this, void 0, void 0, function () {
                var queryRunner, _a, productoId, tipo, cantidad, nota, usuarioId, almacenOrigen, almacenDestino, referencia, lote, technicianId, technicianName, batchGenerated, producto, tipoNormalizado, cantidadNumerica, nuevoStock, technician, targetAlmacen, stockOrigen, disponibleOrigen, tiposIncremento, tiposDecremento, stockEnAlmacen, cantidadDisponibleAlmacen, allStocks, movement, savedMovement, err_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            queryRunner = this.dataSource.createQueryRunner();
                            return [4 /*yield*/, queryRunner.connect()];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, queryRunner.startTransaction()];
                        case 2:
                            _b.sent();
                            _a = createMovementDto, productoId = _a.productoId, tipo = _a.tipo, cantidad = _a.cantidad, nota = _a.nota, usuarioId = _a.usuarioId, almacenOrigen = _a.almacenOrigen, almacenDestino = _a.almacenDestino, referencia = _a.referencia, lote = _a.lote, technicianId = _a.technicianId, technicianName = _a.technicianName;
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 25, 27, 29]);
                            batchGenerated = '';
                            return [4 /*yield*/, queryRunner.manager.findOne(product_entity_1.Product, { where: { id: Number(productoId) } })];
                        case 4:
                            producto = _b.sent();
                            if (!producto) {
                                throw new common_1.NotFoundException("Producto con ID ".concat(productoId, " no encontrado"));
                            }
                            return [4 /*yield*/, this.ensureDetailedStockInitialized(queryRunner.manager, producto)];
                        case 5:
                            _b.sent();
                            tipoNormalizado = tipo.toUpperCase();
                            cantidadNumerica = Number(cantidad);
                            nuevoStock = Number(producto.stock);
                            return [4 /*yield*/, this.resolveTechnician(queryRunner.manager, technicianId, technicianName)];
                        case 6:
                            technician = _b.sent();
                            targetAlmacen = (almacenDestino || almacenOrigen || producto.almacen || 'Principal').trim();
                            if (!(tipoNormalizado === 'TRANSFERIR')) return [3 /*break*/, 10];
                            if (!almacenOrigen || !almacenDestino) {
                                throw new common_1.BadRequestException('Para una transferencia se requiere un almacén de origen y uno de destino.');
                            }
                            return [4 /*yield*/, queryRunner.manager.findOne(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                                    where: { productoId: producto.id, almacen: almacenOrigen.trim() }
                                })];
                        case 7:
                            stockOrigen = _b.sent();
                            disponibleOrigen = stockOrigen ? Number(stockOrigen.cantidad) : 0;
                            if (disponibleOrigen < cantidadNumerica) {
                                throw new common_1.BadRequestException("Stock insuficiente en almac\u00E9n de origen '".concat(almacenOrigen, "'. Disponible: ").concat(disponibleOrigen, ", Requerido: ").concat(cantidadNumerica));
                            }
                            return [4 /*yield*/, this.updateWarehouseStock(queryRunner.manager, producto.id, almacenOrigen, -cantidadNumerica)];
                        case 8:
                            _b.sent();
                            return [4 /*yield*/, this.updateWarehouseStock(queryRunner.manager, producto.id, almacenDestino, cantidadNumerica)];
                        case 9:
                            _b.sent();
                            return [3 /*break*/, 21];
                        case 10:
                            tiposIncremento = ['ENTRADA', 'RECIBIR', 'DEVOLUCION_FACTURA'];
                            tiposDecremento = ['SALIDA', 'DESPACHAR', 'DESCARTAR', 'DEVOLUCION'];
                            if (!tiposIncremento.includes(tipoNormalizado)) return [3 /*break*/, 13];
                            nuevoStock += cantidadNumerica;
                            return [4 /*yield*/, this.updateWarehouseStock(queryRunner.manager, producto.id, targetAlmacen, cantidadNumerica)];
                        case 11:
                            _b.sent();
                            return [4 /*yield*/, this.generateAndSaveBatch(queryRunner.manager, producto.id, cantidadNumerica, targetAlmacen, lote)];
                        case 12:
                            batchGenerated = _b.sent();
                            return [3 /*break*/, 20];
                        case 13:
                            if (!tiposDecremento.includes(tipoNormalizado)) return [3 /*break*/, 16];
                            return [4 /*yield*/, queryRunner.manager.findOne(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                                    where: { productoId: producto.id, almacen: targetAlmacen }
                                })];
                        case 14:
                            stockEnAlmacen = _b.sent();
                            cantidadDisponibleAlmacen = stockEnAlmacen ? Number(stockEnAlmacen.cantidad) : 0;
                            if (cantidadDisponibleAlmacen < cantidadNumerica) {
                                throw new common_1.BadRequestException("Stock insuficiente en el almac\u00E9n '".concat(targetAlmacen, "' para ").concat(producto.nombre, ". Disponible: ").concat(cantidadDisponibleAlmacen, ", Solicitado: ").concat(cantidadNumerica));
                            }
                            nuevoStock -= cantidadNumerica;
                            return [4 /*yield*/, this.updateWarehouseStock(queryRunner.manager, producto.id, targetAlmacen, -cantidadNumerica)];
                        case 15:
                            _b.sent();
                            return [3 /*break*/, 20];
                        case 16:
                            if (!(tipoNormalizado === 'AJUSTE' || tipoNormalizado === 'AJUSTAR')) return [3 /*break*/, 19];
                            if (cantidadNumerica < 0)
                                throw new common_1.BadRequestException('El stock no puede ser negativo tras un ajuste');
                            return [4 /*yield*/, this.updateWarehouseStock(queryRunner.manager, producto.id, targetAlmacen, cantidadNumerica, true)];
                        case 17:
                            _b.sent();
                            return [4 /*yield*/, queryRunner.manager.find(product_warehouse_stock_entity_1.ProductWarehouseStock, { where: { productoId: producto.id } })];
                        case 18:
                            allStocks = _b.sent();
                            nuevoStock = allStocks.reduce(function (sum, s) { return sum + Number(s.cantidad); }, 0);
                            if (createMovementDto.costoUnitario !== undefined && createMovementDto.costoUnitario !== null) {
                                producto.precio = Number(createMovementDto.costoUnitario);
                            }
                            return [3 /*break*/, 20];
                        case 19: throw new common_1.BadRequestException("Tipo de movimiento no v\u00E1lido: ".concat(tipo));
                        case 20:
                            producto.stock = nuevoStock;
                            _b.label = 21;
                        case 21: return [4 /*yield*/, queryRunner.manager.update(product_entity_1.Product, producto.id, {
                                stock: nuevoStock,
                                precio: producto.precio
                            })];
                        case 22:
                            _b.sent();
                            movement = queryRunner.manager.create(movement_entity_1.Movement, {
                                producto: producto,
                                productoId: producto.id,
                                tipo: tipoNormalizado,
                                cantidad: cantidadNumerica,
                                nuevoStock: Number(nuevoStock),
                                nota: batchGenerated ? "".concat(nota || '', " | Lote: ").concat(batchGenerated) : nota,
                                technician: technician || undefined,
                                technicianId: technician === null || technician === void 0 ? void 0 : technician.id,
                                usuarioId: usuarioId ? String(usuarioId) : undefined,
                                almacenOrigen: almacenOrigen || targetAlmacen,
                                almacenDestino: almacenDestino || targetAlmacen,
                                costoUnitario: createMovementDto.costoUnitario ? Number(createMovementDto.costoUnitario) : undefined,
                                referencia: referencia || undefined,
                            });
                            return [4 /*yield*/, queryRunner.manager.save(movement_entity_1.Movement, movement)];
                        case 23:
                            savedMovement = _b.sent();
                            if (technician)
                                savedMovement.technician = technician;
                            return [4 /*yield*/, queryRunner.commitTransaction()];
                        case 24:
                            _b.sent();
                            return [2 /*return*/, savedMovement];
                        case 25:
                            err_2 = _b.sent();
                            return [4 /*yield*/, queryRunner.rollbackTransaction()];
                        case 26:
                            _b.sent();
                            throw err_2;
                        case 27: return [4 /*yield*/, queryRunner.release()];
                        case 28:
                            _b.sent();
                            return [7 /*endfinally*/];
                        case 29: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * PROCESAR RECIBO / DESPACHO MASIVO (Atómico)
         */
        MovementsService_1.prototype.createBulk = function (bulkData) {
            return __awaiter(this, void 0, void 0, function () {
                var tipo, nota, items, usuarioId, referencia, queryRunner, movimientosCreados, tipoNormalizado, finalUsuarioId, tiposIncremento, tiposDecremento, _i, _a, _b, index, item, productoId, cantidad, almacen, lote, serials, idNum, numeroLinea, almacenNormalizado, producto, nuevoStock, batchInfo, totalSeriales, _c, serials_1, serialNumber, serialLimpio, serialExistente, nuevoSerial, _d, serials_2, serialNumber, serialADespachar, cantidadNumerica, stockEnAlmacen, cantidadDisponibleAlmacen, cantidadMovimiento, nuevoMovimiento, guardado, err_3;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            tipo = bulkData.tipo, nota = bulkData.nota, items = bulkData.items, usuarioId = bulkData.usuarioId, referencia = bulkData.referencia;
                            if (!Array.isArray(items) || items.length === 0) {
                                throw new common_1.BadRequestException('Debe incluir al menos una línea de mercancía');
                            }
                            queryRunner = this.dataSource.createQueryRunner();
                            return [4 /*yield*/, queryRunner.connect()];
                        case 1:
                            _e.sent();
                            return [4 /*yield*/, queryRunner.startTransaction()];
                        case 2:
                            _e.sent();
                            _e.label = 3;
                        case 3:
                            _e.trys.push([3, 35, 37, 39]);
                            movimientosCreados = [];
                            tipoNormalizado = tipo ? tipo.trim().toUpperCase() : 'RECIBIR';
                            finalUsuarioId = (usuarioId && !isNaN(Number(usuarioId))) ? String(usuarioId) : undefined;
                            tiposIncremento = ['ENTRADA', 'RECIBIR', 'DEVOLUCION_FACTURA'];
                            tiposDecremento = ['SALIDA', 'DESPACHAR', 'DESCARTAR', 'DEVOLUCION'];
                            if (!tiposIncremento.includes(tipoNormalizado) && !tiposDecremento.includes(tipoNormalizado)) {
                                throw new common_1.BadRequestException("Tipo de movimiento masivo no v\u00E1lido: ".concat(tipo));
                            }
                            _i = 0, _a = items.entries();
                            _e.label = 4;
                        case 4:
                            if (!(_i < _a.length)) return [3 /*break*/, 33];
                            _b = _a[_i], index = _b[0], item = _b[1];
                            productoId = item.productoId, cantidad = item.cantidad, almacen = item.almacen, lote = item.lote, serials = item.serials;
                            idNum = Number(productoId);
                            numeroLinea = index + 1;
                            if (!productoId || isNaN(idNum)) {
                                throw new common_1.BadRequestException("L\u00EDnea ".concat(numeroLinea, ": producto inv\u00E1lido"));
                            }
                            almacenNormalizado = String(almacen || 'Principal').trim() || 'Principal';
                            return [4 /*yield*/, queryRunner.manager.findOne(product_entity_1.Product, { where: { id: idNum } })];
                        case 5:
                            producto = _e.sent();
                            if (!producto) {
                                throw new common_1.NotFoundException("Producto ID ".concat(productoId, " no encontrado en la base de datos"));
                            }
                            return [4 /*yield*/, this.ensureDetailedStockInitialized(queryRunner.manager, producto)];
                        case 6:
                            _e.sent();
                            nuevoStock = Number(producto.stock);
                            batchInfo = '';
                            if (!producto.isSerialized) return [3 /*break*/, 23];
                            if (!Array.isArray(serials) || serials.length === 0) {
                                throw new common_1.BadRequestException("L\u00EDnea ".concat(numeroLinea, " (").concat(producto.nombre, "): Debe proporcionar una lista de seriales para este producto."));
                            }
                            totalSeriales = serials.length;
                            if (!tiposIncremento.includes(tipoNormalizado)) return [3 /*break*/, 14];
                            _c = 0, serials_1 = serials;
                            _e.label = 7;
                        case 7:
                            if (!(_c < serials_1.length)) return [3 /*break*/, 11];
                            serialNumber = serials_1[_c];
                            serialLimpio = serialNumber.trim();
                            if (!serialLimpio)
                                return [3 /*break*/, 10];
                            return [4 /*yield*/, queryRunner.manager.findOne(product_serial_entity_1.ProductSerial, {
                                    where: {
                                        productoId: producto.id,
                                        serialNumber: serialLimpio,
                                    },
                                })];
                        case 8:
                            serialExistente = _e.sent();
                            if (serialExistente) {
                                throw new common_1.BadRequestException("El serial \"".concat(serialLimpio, "\" ya ha sido registrado para el producto \"").concat(producto.nombre, "\"."));
                            }
                            nuevoSerial = queryRunner.manager.create(product_serial_entity_1.ProductSerial, {
                                productoId: producto.id,
                                serialNumber: serialLimpio,
                                almacen: almacenNormalizado,
                                status: product_serial_entity_1.SerialStatus.DISPONIBLE,
                            });
                            return [4 /*yield*/, queryRunner.manager.save(product_serial_entity_1.ProductSerial, nuevoSerial)];
                        case 9:
                            _e.sent();
                            _e.label = 10;
                        case 10:
                            _c++;
                            return [3 /*break*/, 7];
                        case 11: return [4 /*yield*/, this.updateWarehouseStock(queryRunner.manager, producto.id, almacenNormalizado, totalSeriales)];
                        case 12:
                            _e.sent();
                            return [4 /*yield*/, queryRunner.manager.count(product_serial_entity_1.ProductSerial, { where: { productoId: producto.id, status: product_serial_entity_1.SerialStatus.DISPONIBLE } })];
                        case 13:
                            nuevoStock = _e.sent();
                            return [3 /*break*/, 22];
                        case 14:
                            _d = 0, serials_2 = serials;
                            _e.label = 15;
                        case 15:
                            if (!(_d < serials_2.length)) return [3 /*break*/, 19];
                            serialNumber = serials_2[_d];
                            return [4 /*yield*/, queryRunner.manager.findOne(product_serial_entity_1.ProductSerial, {
                                    where: { productoId: producto.id, serialNumber: serialNumber.trim(), status: product_serial_entity_1.SerialStatus.DISPONIBLE }
                                })];
                        case 16:
                            serialADespachar = _e.sent();
                            if (!serialADespachar) {
                                throw new common_1.BadRequestException("Serial \"".concat(serialNumber, "\" no encontrado o no disponible en el inventario."));
                            }
                            serialADespachar.status = product_serial_entity_1.SerialStatus.VENDIDO;
                            return [4 /*yield*/, queryRunner.manager.save(product_serial_entity_1.ProductSerial, serialADespachar)];
                        case 17:
                            _e.sent();
                            _e.label = 18;
                        case 18:
                            _d++;
                            return [3 /*break*/, 15];
                        case 19: return [4 /*yield*/, this.updateWarehouseStock(queryRunner.manager, producto.id, almacenNormalizado, -totalSeriales)];
                        case 20:
                            _e.sent();
                            return [4 /*yield*/, queryRunner.manager.count(product_serial_entity_1.ProductSerial, { where: { productoId: producto.id, status: product_serial_entity_1.SerialStatus.DISPONIBLE } })];
                        case 21:
                            nuevoStock = _e.sent();
                            _e.label = 22;
                        case 22: return [3 /*break*/, 29];
                        case 23:
                            cantidadNumerica = Number(cantidad);
                            if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
                                throw new common_1.BadRequestException("L\u00EDnea ".concat(numeroLinea, ": la cantidad debe ser mayor a 0"));
                            }
                            if (!tiposIncremento.includes(tipoNormalizado)) return [3 /*break*/, 26];
                            nuevoStock += cantidadNumerica;
                            return [4 /*yield*/, this.updateWarehouseStock(queryRunner.manager, producto.id, almacenNormalizado, cantidadNumerica)];
                        case 24:
                            _e.sent();
                            return [4 /*yield*/, this.generateAndSaveBatch(queryRunner.manager, idNum, cantidadNumerica, almacenNormalizado, lote)];
                        case 25:
                            batchInfo = _e.sent();
                            return [3 /*break*/, 29];
                        case 26:
                            if (!tiposDecremento.includes(tipoNormalizado)) return [3 /*break*/, 29];
                            return [4 /*yield*/, queryRunner.manager.findOne(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                                    where: { productoId: producto.id, almacen: almacenNormalizado }
                                })];
                        case 27:
                            stockEnAlmacen = _e.sent();
                            cantidadDisponibleAlmacen = stockEnAlmacen ? Number(stockEnAlmacen.cantidad) : 0;
                            if (cantidadDisponibleAlmacen < cantidadNumerica) {
                                throw new common_1.BadRequestException("Stock insuficiente en el almac\u00E9n '".concat(almacenNormalizado, "' para ").concat(producto.nombre, ". Disponible: ").concat(cantidadDisponibleAlmacen, ", Solicitado: ").concat(cantidadNumerica));
                            }
                            nuevoStock -= cantidadNumerica;
                            return [4 /*yield*/, this.updateWarehouseStock(queryRunner.manager, producto.id, almacenNormalizado, -cantidadNumerica)];
                        case 28:
                            _e.sent();
                            _e.label = 29;
                        case 29: 
                        // --- FIN DE LA LÓGICA DE SERIALIZACIÓN ---
                        return [4 /*yield*/, queryRunner.manager.update(product_entity_1.Product, producto.id, { stock: nuevoStock })];
                        case 30:
                            // --- FIN DE LA LÓGICA DE SERIALIZACIÓN ---
                            _e.sent();
                            producto.stock = nuevoStock;
                            cantidadMovimiento = producto.isSerialized ? ((serials === null || serials === void 0 ? void 0 : serials.length) || 0) : Number(cantidad);
                            nuevoMovimiento = queryRunner.manager.create(movement_entity_1.Movement, {
                                producto: producto,
                                productoId: producto.id,
                                tipo: tipoNormalizado,
                                cantidad: cantidadMovimiento,
                                nuevoStock: Number(producto.stock),
                                nota: "".concat(nota || '').concat(batchInfo ? " | Lote: ".concat(batchInfo) : '', " | Almac\u00E9n: ").concat(almacenNormalizado),
                                costoUnitario: producto.precio ? Number(producto.precio) : undefined,
                                almacenOrigen: almacenNormalizado,
                                almacenDestino: almacenNormalizado,
                                referencia: referencia ? String(referencia) : undefined,
                                usuarioId: finalUsuarioId,
                            });
                            return [4 /*yield*/, queryRunner.manager.save(movement_entity_1.Movement, nuevoMovimiento)];
                        case 31:
                            guardado = _e.sent();
                            movimientosCreados.push(guardado);
                            _e.label = 32;
                        case 32:
                            _i++;
                            return [3 /*break*/, 4];
                        case 33:
                            if (movimientosCreados.length === 0) {
                                throw new common_1.BadRequestException('No se procesó ninguna línea de mercancía');
                            }
                            return [4 /*yield*/, queryRunner.commitTransaction()];
                        case 34:
                            _e.sent();
                            return [2 /*return*/, { success: true, count: movimientosCreados.length, data: movimientosCreados }];
                        case 35:
                            err_3 = _e.sent();
                            return [4 /*yield*/, queryRunner.rollbackTransaction()];
                        case 36:
                            _e.sent();
                            console.error("Error crítico en Bulk Movement:", err_3);
                            throw new common_1.BadRequestException("No se pudo procesar el movimiento: ".concat(err_3.message));
                        case 37: return [4 /*yield*/, queryRunner.release()];
                        case 38:
                            _e.sent();
                            return [7 /*endfinally*/];
                        case 39: return [2 /*return*/];
                    }
                });
            });
        };
        MovementsService_1.prototype.assignSerialsToTechnician = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var technicianId, serials, usuarioId, queryRunner, technician, uniqueSerials, productSerials, foundSerials_1, notFound, movementsToCreate, productsToUpdate, _i, productSerials_1, serial, productId, stockDisponible, _a, _b, _c, productId, newStock, error_1;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            technicianId = dto.technicianId, serials = dto.serials, usuarioId = dto.usuarioId;
                            queryRunner = this.dataSource.createQueryRunner();
                            return [4 /*yield*/, queryRunner.connect()];
                        case 1:
                            _d.sent();
                            return [4 /*yield*/, queryRunner.startTransaction()];
                        case 2:
                            _d.sent();
                            _d.label = 3;
                        case 3:
                            _d.trys.push([3, 17, 19, 21]);
                            return [4 /*yield*/, queryRunner.manager.findOne(technician_entity_1.Technician, { where: { id: technicianId } })];
                        case 4:
                            technician = _d.sent();
                            if (!technician) {
                                throw new common_1.NotFoundException("T\u00E9cnico con ID ".concat(technicianId, " no encontrado."));
                            }
                            uniqueSerials = __spreadArray([], new Set(serials.map(function (s) { return s.trim(); }).filter(Boolean)), true);
                            if (uniqueSerials.length === 0) {
                                throw new common_1.BadRequestException('Debe proporcionar al menos un número de serie válido.');
                            }
                            return [4 /*yield*/, queryRunner.manager.find(product_serial_entity_1.ProductSerial, {
                                    where: { serialNumber: (0, typeorm_1.In)(uniqueSerials) },
                                    relations: ['producto'],
                                })];
                        case 5:
                            productSerials = _d.sent();
                            if (productSerials.length !== uniqueSerials.length) {
                                foundSerials_1 = productSerials.map(function (ps) { return ps.serialNumber; });
                                notFound = uniqueSerials.filter(function (s) { return !foundSerials_1.includes(s); });
                                throw new common_1.NotFoundException("Los siguientes seriales no se encontraron: ".concat(notFound.join(', ')));
                            }
                            movementsToCreate = [];
                            productsToUpdate = new Map();
                            _i = 0, productSerials_1 = productSerials;
                            _d.label = 6;
                        case 6:
                            if (!(_i < productSerials_1.length)) return [3 /*break*/, 10];
                            serial = productSerials_1[_i];
                            if (serial.status !== product_serial_entity_1.SerialStatus.DISPONIBLE) {
                                throw new common_1.BadRequestException("El serial ".concat(serial.serialNumber, " no est\u00E1 disponible (estado actual: ").concat(serial.status, ")."));
                            }
                            // 1. Cambiar estado del serial a asignado
                            serial.status = product_serial_entity_1.SerialStatus.ASIGNADO_TECNICO;
                            return [4 /*yield*/, queryRunner.manager.save(product_serial_entity_1.ProductSerial, serial)];
                        case 7:
                            _d.sent();
                            productId = serial.productoId;
                            return [4 /*yield*/, queryRunner.manager.count(product_serial_entity_1.ProductSerial, {
                                    where: { productoId: productId, status: product_serial_entity_1.SerialStatus.DISPONIBLE },
                                })];
                        case 8:
                            stockDisponible = _d.sent();
                            productsToUpdate.set(productId, stockDisponible);
                            // 2. Construir el objeto del movimiento usando casting seguro
                            movementsToCreate.push({
                                productoId: productId,
                                tipo: 'ASIGNACION_TECNICO',
                                cantidad: 1,
                                nota: "Asignado al t\u00E9cnico: ".concat(technician.nombre, " | Serial: ").concat(serial.serialNumber),
                                serials: [serial.serialNumber], // 👈 Ahora pasará sin chistar por el cambio de tipo de la lista
                                technicianId: technician.id,
                                usuarioId: usuarioId ? String(usuarioId) : undefined,
                                nuevoStock: productsToUpdate.get(productId),
                                almacenOrigen: serial.almacen,
                                almacenDestino: 'Móvil (Técnico)',
                            });
                            _d.label = 9;
                        case 9:
                            _i++;
                            return [3 /*break*/, 6];
                        case 10:
                            _a = 0, _b = productsToUpdate.entries();
                            _d.label = 11;
                        case 11:
                            if (!(_a < _b.length)) return [3 /*break*/, 14];
                            _c = _b[_a], productId = _c[0], newStock = _c[1];
                            return [4 /*yield*/, queryRunner.manager.update(product_entity_1.Product, productId, { stock: newStock })];
                        case 12:
                            _d.sent();
                            _d.label = 13;
                        case 13:
                            _a++;
                            return [3 /*break*/, 11];
                        case 14: 
                        // 4. Guardar los logs de movimientos de forma masiva
                        return [4 /*yield*/, queryRunner.manager.save(movement_entity_1.Movement, movementsToCreate)];
                        case 15:
                            // 4. Guardar los logs de movimientos de forma masiva
                            _d.sent();
                            return [4 /*yield*/, queryRunner.commitTransaction()];
                        case 16:
                            _d.sent();
                            return [2 /*return*/, { message: "".concat(uniqueSerials.length, " serial(es) asignado(s) a ").concat(technician.nombre, " con \u00E9xito.") }];
                        case 17:
                            error_1 = _d.sent();
                            return [4 /*yield*/, queryRunner.rollbackTransaction()];
                        case 18:
                            _d.sent();
                            throw error_1;
                        case 19: return [4 /*yield*/, queryRunner.release()];
                        case 20:
                            _d.sent();
                            return [7 /*endfinally*/];
                        case 21: return [2 /*return*/];
                    }
                });
            });
        };
        MovementsService_1.prototype.returnSerialFromTechnician = function (dto, usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                var serialRaw, nota, queryRunner, serial, producto, nuevoStock, movement, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            serialRaw = dto.serialNumber || dto.serial;
                            nota = dto.nota;
                            if (!serialRaw) {
                                throw new common_1.BadRequestException('El número de serie es requerido para procesar la devolución.');
                            }
                            queryRunner = this.dataSource.createQueryRunner();
                            return [4 /*yield*/, queryRunner.connect()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, queryRunner.startTransaction()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 11, 13, 15]);
                            return [4 /*yield*/, queryRunner.manager.findOne(product_serial_entity_1.ProductSerial, {
                                    where: { serialNumber: serialRaw.trim() },
                                    relations: ['producto'],
                                })];
                        case 4:
                            serial = _a.sent();
                            if (!serial) {
                                throw new common_1.NotFoundException("El serial '".concat(serialRaw, "' no fue encontrado en el sistema."));
                            }
                            if (serial.status !== product_serial_entity_1.SerialStatus.ASIGNADO_TECNICO) {
                                throw new common_1.BadRequestException("El serial '".concat(serialRaw, "' no est\u00E1 asignado a un t\u00E9cnico (Estado actual: ").concat(serial.status, ")."));
                            }
                            // 2. Cambiar el estado del serial a 'disponible'
                            serial.status = product_serial_entity_1.SerialStatus.DISPONIBLE;
                            serial.lastReturnNote = nota !== null && nota !== void 0 ? nota : serial.lastReturnNote;
                            // Pasamos explícitamente la entidad ProductSerial al save para mayor seguridad
                            return [4 /*yield*/, queryRunner.manager.save(product_serial_entity_1.ProductSerial, serial)];
                        case 5:
                            // Pasamos explícitamente la entidad ProductSerial al save para mayor seguridad
                            _a.sent();
                            producto = serial.producto;
                            if (!producto) return [3 /*break*/, 9];
                            return [4 /*yield*/, queryRunner.manager.count(product_serial_entity_1.ProductSerial, {
                                    where: { productoId: producto.id, status: product_serial_entity_1.SerialStatus.DISPONIBLE },
                                })];
                        case 6:
                            nuevoStock = _a.sent();
                            return [4 /*yield*/, queryRunner.manager.update(product_entity_1.Product, producto.id, { stock: nuevoStock })];
                        case 7:
                            _a.sent();
                            movement = queryRunner.manager.create(movement_entity_1.Movement, {
                                productoId: producto.id,
                                tipo: 'DEVOLUCION_TECNICO',
                                cantidad: 1,
                                nuevoStock: nuevoStock,
                                nota: "Devoluci\u00F3n de t\u00E9cnico. ".concat(nota || '').trim(),
                                serials: [serial.serialNumber],
                                usuarioId: usuarioId,
                                almacenOrigen: 'Móvil (Técnico)',
                                almacenDestino: serial.almacen || 'Principal', // Vuelve a su almacén original
                            });
                            return [4 /*yield*/, queryRunner.manager.save(movement_entity_1.Movement, movement)];
                        case 8:
                            _a.sent();
                            _a.label = 9;
                        case 9: return [4 /*yield*/, queryRunner.commitTransaction()];
                        case 10:
                            _a.sent();
                            return [2 /*return*/, { message: "Serial '".concat(serialRaw, "' devuelto al inventario con \u00E9xito.") }];
                        case 11:
                            error_2 = _a.sent();
                            return [4 /*yield*/, queryRunner.rollbackTransaction()];
                        case 12:
                            _a.sent();
                            throw error_2;
                        case 13: return [4 /*yield*/, queryRunner.release()];
                        case 14:
                            _a.sent();
                            return [7 /*endfinally*/];
                        case 15: return [2 /*return*/];
                    }
                });
            });
        };
        MovementsService_1.prototype.findAll = function (usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                var queryOptions;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            queryOptions = {
                                relations: ['producto', 'technician', 'usuario'],
                                order: { createdAt: 'DESC' },
                            };
                            if (usuarioId) {
                                queryOptions.where = { usuarioId: usuarioId };
                            }
                            return [4 /*yield*/, this.movementRepository.find(queryOptions)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        MovementsService_1.prototype.findByProductId = function (productoId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.movementRepository.find({
                                where: { productoId: productoId },
                                relations: ['producto', 'technician', 'usuario'],
                                order: { createdAt: 'DESC' },
                            })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        MovementsService_1.prototype.findBySerialNumber = function (serialNumber) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.movementRepository
                            .createQueryBuilder('movement')
                            .leftJoinAndSelect('movement.producto', 'producto')
                            .leftJoinAndSelect('movement.usuario', 'usuario')
                            .where("movement.serials @> :serial", { serial: "[\"".concat(serialNumber, "\"]") })
                            .orderBy('movement.createdAt', 'DESC')
                            .getMany()];
                });
            });
        };
        // --- GESTIÓN DE LOTES (INVENTORY BATCHES) ---
        MovementsService_1.prototype.findAllBatches = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.inventoryBatchRepository.find({
                            relations: ['producto'],
                            order: { createdAt: 'DESC' },
                        })];
                });
            });
        };
        MovementsService_1.prototype.createBatch = function (createDto) {
            return __awaiter(this, void 0, void 0, function () {
                var queryRunner, productoId, cantidad, almacen, numeroLote, producto, nuevoLote, allStocks, nuevoStockTotal, movement, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            queryRunner = this.dataSource.createQueryRunner();
                            return [4 /*yield*/, queryRunner.connect()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, queryRunner.startTransaction()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 11, 13, 15]);
                            productoId = createDto.productoId, cantidad = createDto.cantidad, almacen = createDto.almacen, numeroLote = createDto.numeroLote;
                            return [4 /*yield*/, queryRunner.manager.findOne(product_entity_1.Product, { where: { id: productoId } })];
                        case 4:
                            producto = _a.sent();
                            if (!producto) {
                                throw new common_1.NotFoundException("Producto con ID ".concat(productoId, " no encontrado."));
                            }
                            nuevoLote = this.inventoryBatchRepository.create(__assign(__assign({}, createDto), { producto: producto }));
                            return [4 /*yield*/, queryRunner.manager.save(nuevoLote)];
                        case 5:
                            _a.sent();
                            // 2. Actualizar el stock del producto
                            return [4 /*yield*/, this.updateWarehouseStock(queryRunner.manager, producto.id, almacen, cantidad)];
                        case 6:
                            // 2. Actualizar el stock del producto
                            _a.sent();
                            return [4 /*yield*/, queryRunner.manager.find(product_warehouse_stock_entity_1.ProductWarehouseStock, { where: { productoId: producto.id } })];
                        case 7:
                            allStocks = _a.sent();
                            nuevoStockTotal = allStocks.reduce(function (sum, s) { return sum + Number(s.cantidad); }, 0);
                            return [4 /*yield*/, queryRunner.manager.update(product_entity_1.Product, producto.id, { stock: nuevoStockTotal })];
                        case 8:
                            _a.sent();
                            movement = queryRunner.manager.create(movement_entity_1.Movement, {
                                productoId: producto.id,
                                tipo: 'ENTRADA',
                                cantidad: cantidad,
                                nuevoStock: nuevoStockTotal,
                                nota: "Ingreso por creaci\u00F3n de lote: ".concat(numeroLote),
                                almacenDestino: almacen,
                            });
                            return [4 /*yield*/, queryRunner.manager.save(movement)];
                        case 9:
                            _a.sent();
                            return [4 /*yield*/, queryRunner.commitTransaction()];
                        case 10:
                            _a.sent();
                            return [2 /*return*/, nuevoLote];
                        case 11:
                            error_3 = _a.sent();
                            return [4 /*yield*/, queryRunner.rollbackTransaction()];
                        case 12:
                            _a.sent();
                            throw error_3;
                        case 13: return [4 /*yield*/, queryRunner.release()];
                        case 14:
                            _a.sent();
                            return [7 /*endfinally*/];
                        case 15: return [2 /*return*/];
                    }
                });
            });
        };
        MovementsService_1.prototype.updateBatch = function (id, updateDto) {
            return __awaiter(this, void 0, void 0, function () {
                var lote;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.inventoryBatchRepository.preload(__assign({ id: id }, updateDto))];
                        case 1:
                            lote = _a.sent();
                            if (!lote) {
                                throw new common_1.NotFoundException("Lote con ID ".concat(id, " no encontrado."));
                            }
                            return [2 /*return*/, this.inventoryBatchRepository.save(lote)];
                    }
                });
            });
        };
        MovementsService_1.prototype.removeBatch = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var lote;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.inventoryBatchRepository.findOneBy({ id: id })];
                        case 1:
                            lote = _a.sent();
                            if (!lote) {
                                throw new common_1.NotFoundException("Lote con ID ".concat(id, " no encontrado."));
                            }
                            return [4 /*yield*/, this.inventoryBatchRepository.remove(lote)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { message: "Lote con ID ".concat(id, " eliminado.") }];
                    }
                });
            });
        };
        return MovementsService_1;
    }());
    __setFunctionName(_classThis, "MovementsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MovementsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MovementsService = _classThis;
}();
exports.MovementsService = MovementsService;
