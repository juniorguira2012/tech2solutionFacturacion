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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.ProductsService = void 0;
var common_1 = require("@nestjs/common");
var product_entity_1 = require("./entities/product.entity");
var provider_entity_1 = require("../providers/entities/provider.entity");
var product_serial_entity_1 = require("./entities/product-serial.entity");
var movement_entity_1 = require("../movements/entities/movement.entity");
var ProductsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ProductsService = _classThis = /** @class */ (function () {
        function ProductsService_1(productRepository, providerRepository, dataSource) {
            this.productRepository = productRepository;
            this.providerRepository = providerRepository;
            this.dataSource = dataSource;
        }
        // Crear un producto
        ProductsService_1.prototype.create = function (createProductDto) {
            return __awaiter(this, void 0, void 0, function () {
                var queryRunner, serials, nota, productData, provider, datosConAlmacen, nuevoProducto_1, uniqueSerials, serialesExistentes, productoGuardado, error_1;
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
                            _a.trys.push([3, 10, 12, 14]);
                            serials = createProductDto.serials, nota = createProductDto.nota, productData = __rest(createProductDto, ["serials", "nota"]);
                            if (!productData.proveedorId) return [3 /*break*/, 5];
                            return [4 /*yield*/, queryRunner.manager.findOneBy(provider_entity_1.Provider, { id: productData.proveedorId })];
                        case 4:
                            provider = _a.sent();
                            if (!provider) {
                                throw new common_1.NotFoundException("Proveedor con ID ".concat(productData.proveedorId, " no encontrado."));
                            }
                            _a.label = 5;
                        case 5:
                            datosConAlmacen = __assign(__assign({}, productData), { isSerialized: productData.isSerialized || false, almacen: productData.almacen || 'Principal', nota: nota });
                            nuevoProducto_1 = queryRunner.manager.create(product_entity_1.Product, datosConAlmacen);
                            if (!(nuevoProducto_1.isSerialized && serials && serials.length > 0)) return [3 /*break*/, 7];
                            uniqueSerials = __spreadArray([], new Set(serials), true);
                            if (uniqueSerials.length !== serials.length) {
                                throw new common_1.BadRequestException('La lista contiene números de serie duplicados.');
                            }
                            return [4 /*yield*/, queryRunner.manager
                                    .getRepository(product_serial_entity_1.ProductSerial)
                                    .createQueryBuilder('serial')
                                    .where('serial.serialNumber IN (:...serials)', { serials: uniqueSerials })
                                    .getMany()];
                        case 6:
                            serialesExistentes = _a.sent();
                            if (serialesExistentes.length > 0) {
                                throw new common_1.BadRequestException("Los siguientes seriales ya existen: ".concat(serialesExistentes.map(function (s) { return s.serialNumber; }).join(', ')));
                            }
                            nuevoProducto_1.seriales = uniqueSerials.map(function (serialNumber) {
                                var serialLimpio = serialNumber.trim();
                                return queryRunner.manager.create(product_serial_entity_1.ProductSerial, {
                                    serialNumber: serialLimpio,
                                    status: product_serial_entity_1.SerialStatus.DISPONIBLE,
                                    almacen: nuevoProducto_1.almacen || 'Principal',
                                });
                            });
                            // El stock para productos serializados SIEMPRE se calcula en el backend
                            // para ser la fuente de la verdad, ignorando lo que envíe el frontend.
                            nuevoProducto_1.stock = nuevoProducto_1.seriales.length;
                            _a.label = 7;
                        case 7: return [4 /*yield*/, queryRunner.manager.save(product_entity_1.Product, nuevoProducto_1)];
                        case 8:
                            productoGuardado = _a.sent();
                            return [4 /*yield*/, queryRunner.commitTransaction()];
                        case 9:
                            _a.sent();
                            return [2 /*return*/, productoGuardado];
                        case 10:
                            error_1 = _a.sent();
                            return [4 /*yield*/, queryRunner.rollbackTransaction()];
                        case 11:
                            _a.sent();
                            throw error_1;
                        case 12: return [4 /*yield*/, queryRunner.release()];
                        case 13:
                            _a.sent();
                            return [7 /*endfinally*/];
                        case 14: return [2 /*return*/];
                    }
                });
            });
        };
        // Obtener todos los productos (Lo que usará tu tabla de Inventario)
        ProductsService_1.prototype.findAll = function () {
            return __awaiter(this, arguments, void 0, function (isActive) {
                if (isActive === void 0) { isActive = true; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(isActive === 'all')) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.productRepository.find({
                                    // 💡 MEJORA: Incluimos la relación con seriales para que el POS pueda buscar por ellos.
                                    relations: ['seriales', 'proveedor'],
                                    order: { createdAt: 'DESC' }, // Ordenar por fecha de creación descendente
                                })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2: return [4 /*yield*/, this.productRepository.find({
                                where: { isActive: isActive }, // Usar el parámetro recibido
                                // 💡 MEJORA: También la incluimos en la búsqueda de productos activos.
                                relations: ['seriales', 'proveedor'],
                                order: { createdAt: 'DESC' }, // Los más nuevos primero
                            })];
                        case 3: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        // Obtener uno solo
        ProductsService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var producto;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.productRepository.findOneBy({ id: id })];
                        case 1:
                            producto = _a.sent();
                            if (!producto)
                                throw new common_1.NotFoundException("Producto con ID ".concat(id, " no encontrado"));
                            return [2 /*return*/, producto];
                    }
                });
            });
        };
        ProductsService_1.prototype.update = function (id, updateProductDto) {
            return __awaiter(this, void 0, void 0, function () {
                var queryRunner, serials, productData_1, producto_1, almacenOriginal, almacenNuevo, cambioDeAlmacen, serialesActuales, serialesNuevos, serialesNuevosStr_1, serialesActualesStr_1, serialesAEliminar, _i, serialesAEliminar_1, serial, serialesACrear, numerosDeSerialesACrear, serialesExistentesEnDB, nuevosSerialesGuardados, serialesDisponiblesActuales, serialesDisponiblesNuevos, serialesDisponiblesAEliminar, stockATransferir, movementLog, productoActualizado, error_2;
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
                            _a.trys.push([3, 18, 20, 22]);
                            serials = updateProductDto.serials, productData_1 = __rest(updateProductDto, ["serials"]);
                            return [4 /*yield*/, queryRunner.manager.findOne(product_entity_1.Product, {
                                    where: { id: id },
                                    relations: ['seriales'],
                                })];
                        case 4:
                            producto_1 = _a.sent();
                            if (!producto_1) {
                                throw new common_1.NotFoundException("Producto con ID ".concat(id, " no encontrado."));
                            }
                            almacenOriginal = producto_1.almacen;
                            almacenNuevo = productData_1.almacen;
                            cambioDeAlmacen = almacenNuevo && almacenOriginal !== almacenNuevo;
                            // Actualiza los datos del producto principal en la entidad cargada
                            queryRunner.manager.merge(product_entity_1.Product, producto_1, productData_1);
                            // Si el producto no es serializado y cambia de almacén, transferimos el stock.
                            if (!producto_1.isSerialized && cambioDeAlmacen && producto_1.stock > 0) {
                                // Lógica de transferencia de stock que añadiremos
                            }
                            if (!producto_1.isSerialized) return [3 /*break*/, 11];
                            serialesActuales = producto_1.seriales || [];
                            serialesNuevos = serials !== null && serials !== void 0 ? serials : [];
                            serialesNuevosStr_1 = __spreadArray([], new Set(serialesNuevos.map(function (s) { return String(s).trim(); }).filter(Boolean)), true);
                            if (serials && serialesNuevosStr_1.length !== serials.length) {
                                throw new common_1.BadRequestException('La lista de seriales contiene duplicados.');
                            }
                            serialesActualesStr_1 = serialesActuales.map(function (s) { return s.serialNumber; });
                            serialesAEliminar = serialesActuales.filter(function (s) { return !serialesNuevosStr_1.includes(s.serialNumber); });
                            for (_i = 0, serialesAEliminar_1 = serialesAEliminar; _i < serialesAEliminar_1.length; _i++) {
                                serial = serialesAEliminar_1[_i];
                                if (serial.status !== product_serial_entity_1.SerialStatus.DISPONIBLE) {
                                    throw new common_1.BadRequestException("No se puede eliminar el serial '".concat(serial.serialNumber, "' porque su estado es '").concat(serial.status, "'."));
                                }
                            }
                            if (!(serialesAEliminar.length > 0)) return [3 /*break*/, 6];
                            return [4 /*yield*/, queryRunner.manager.remove(serialesAEliminar)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            serialesACrear = serialesNuevosStr_1
                                .filter(function (s) { return !serialesActualesStr_1.includes(s); })
                                .map(function (serialNumber) {
                                var _a, _b;
                                return queryRunner.manager.create(product_serial_entity_1.ProductSerial, {
                                    productoId: id,
                                    serialNumber: serialNumber,
                                    status: product_serial_entity_1.SerialStatus.DISPONIBLE,
                                    // Usamos el almacén que viene en la actualización, o el que ya tenía el producto.
                                    almacen: (_b = (_a = productData_1.almacen) !== null && _a !== void 0 ? _a : producto_1.almacen) !== null && _b !== void 0 ? _b : 'Principal',
                                });
                            });
                            if (!(serialesACrear.length > 0)) return [3 /*break*/, 8];
                            numerosDeSerialesACrear = serialesACrear.map(function (s) { return s.serialNumber; });
                            return [4 /*yield*/, queryRunner.manager
                                    .getRepository(product_serial_entity_1.ProductSerial)
                                    .createQueryBuilder('serial')
                                    .where('serial.serialNumber IN (:...serials)', { serials: numerosDeSerialesACrear })
                                    .getMany()];
                        case 7:
                            serialesExistentesEnDB = _a.sent();
                            if (serialesExistentesEnDB.length > 0) {
                                throw new common_1.BadRequestException("No se puede a\u00F1adir, los seriales ya existen: ".concat(serialesExistentesEnDB.map(function (s) { return s.serialNumber; }).join(', ')));
                            }
                            _a.label = 8;
                        case 8:
                            if (!(serialesACrear.length > 0)) return [3 /*break*/, 10];
                            return [4 /*yield*/, queryRunner.manager.save(product_serial_entity_1.ProductSerial, serialesACrear)];
                        case 9:
                            nuevosSerialesGuardados = _a.sent();
                            producto_1.seriales = __spreadArray(__spreadArray([], (producto_1.seriales || []), true), nuevosSerialesGuardados, true);
                            _a.label = 10;
                        case 10:
                            serialesDisponiblesActuales = serialesActuales.filter(function (s) { return s.status === product_serial_entity_1.SerialStatus.DISPONIBLE; }).length;
                            serialesDisponiblesNuevos = serialesACrear.length;
                            serialesDisponiblesAEliminar = serialesAEliminar.filter(function (s) { return s.status === product_serial_entity_1.SerialStatus.DISPONIBLE; }).length;
                            producto_1.stock = serialesDisponiblesActuales + serialesDisponiblesNuevos - serialesDisponiblesAEliminar;
                            _a.label = 11;
                        case 11:
                            if (!(!producto_1.isSerialized && cambioDeAlmacen && producto_1.stock > 0)) return [3 /*break*/, 15];
                            stockATransferir = Number(producto_1.stock);
                            // Restar del origen
                            return [4 /*yield*/, queryRunner.manager.query("UPDATE product_warehouse_stock SET cantidad = cantidad - $1 WHERE \"productoId\" = $2 AND almacen = $3", [stockATransferir, id, almacenOriginal])];
                        case 12:
                            // Restar del origen
                            _a.sent();
                            // Sumar al destino (o crearlo si no existe)
                            return [4 /*yield*/, queryRunner.manager.query("INSERT INTO product_warehouse_stock (\"productoId\", almacen, cantidad) VALUES ($1, $2, $3)\n           ON CONFLICT (\"productoId\", almacen) DO UPDATE SET cantidad = product_warehouse_stock.cantidad + $3", [id, almacenNuevo, stockATransferir])];
                        case 13:
                            // Sumar al destino (o crearlo si no existe)
                            _a.sent();
                            movementLog = queryRunner.manager.create(movement_entity_1.Movement, {
                                productoId: id,
                                tipo: 'TRANSFERENCIA',
                                cantidad: stockATransferir,
                                nota: "Cambio de almac\u00E9n principal de ".concat(almacenOriginal, " a ").concat(almacenNuevo),
                                almacenOrigen: almacenOriginal,
                                almacenDestino: almacenNuevo,
                            });
                            return [4 /*yield*/, queryRunner.manager.save(movementLog)];
                        case 14:
                            _a.sent();
                            _a.label = 15;
                        case 15: return [4 /*yield*/, queryRunner.manager.save(product_entity_1.Product, producto_1)];
                        case 16:
                            productoActualizado = _a.sent();
                            return [4 /*yield*/, queryRunner.commitTransaction()];
                        case 17:
                            _a.sent();
                            return [2 /*return*/, productoActualizado];
                        case 18:
                            error_2 = _a.sent();
                            return [4 /*yield*/, queryRunner.rollbackTransaction()];
                        case 19:
                            _a.sent();
                            throw error_2;
                        case 20: return [4 /*yield*/, queryRunner.release()];
                        case 21:
                            _a.sent();
                            return [7 /*endfinally*/];
                        case 22: return [2 /*return*/];
                    }
                });
            });
        };
        ProductsService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var producto;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            producto = _a.sent();
                            if (!producto.isActive) {
                                throw new common_1.BadRequestException("El producto con ID ".concat(id, " ya se encuentra inactivo."));
                            }
                            // 2. Usamos .update() directo apuntando al ID. 
                            // Esto modifica ÚNICAMENTE la tabla 'products' e ignora por completo el 'cascade: true'
                            return [4 /*yield*/, this.productRepository.update(id, { isActive: false })];
                        case 2:
                            // 2. Usamos .update() directo apuntando al ID. 
                            // Esto modifica ÚNICAMENTE la tabla 'products' e ignora por completo el 'cascade: true'
                            _a.sent();
                            // 3. Retornamos el objeto actualizado de forma segura para la respuesta del controlador
                            return [2 /*return*/, __assign(__assign({}, producto), { isActive: false })];
                    }
                });
            });
        };
        // Restaurar producto (Borrado lógico inverso)
        ProductsService_1.prototype.restore = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var producto;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            producto = _a.sent();
                            if (producto.isActive) {
                                throw new common_1.BadRequestException("El producto con ID ".concat(id, " ya est\u00E1 activo."));
                            }
                            producto.isActive = true;
                            return [4 /*yield*/, this.productRepository.save(producto)];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        // --- NUEVO MÉTODO PARA EL RESUMEN DE INVENTARIO ---
        ProductsService_1.prototype.getInventorySummary = function () {
            return __awaiter(this, void 0, void 0, function () {
                var totalValueResult, totalValue, productsPerCategory, totalsResult;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.productRepository
                                .createQueryBuilder('product')
                                .select('SUM(product.stock * product.precio)', 'totalValue')
                                .where('product.isActive = :isActive', { isActive: true })
                                .getRawOne()];
                        case 1:
                            totalValueResult = _a.sent();
                            totalValue = parseFloat(totalValueResult.totalValue) || 0;
                            return [4 /*yield*/, this.productRepository
                                    .createQueryBuilder('product')
                                    .select('product.categoria', 'category')
                                    .addSelect('COUNT(product.id)', 'count')
                                    .where('product.isActive = :isActive', { isActive: true })
                                    .groupBy('product.categoria')
                                    .orderBy('count', 'DESC')
                                    .getRawMany()];
                        case 2:
                            productsPerCategory = _a.sent();
                            return [4 /*yield*/, this.productRepository
                                    .createQueryBuilder('product')
                                    .select('COUNT(product.id)', 'totalProducts')
                                    .addSelect('SUM(product.stock)', 'totalStock')
                                    .where('product.isActive = :isActive', { isActive: true })
                                    .getRawOne()];
                        case 3:
                            totalsResult = _a.sent();
                            return [2 /*return*/, {
                                    totalValue: totalValue,
                                    productsPerCategory: productsPerCategory,
                                    totalProducts: parseInt(totalsResult.totalProducts, 10) || 0,
                                    totalStock: parseInt(totalsResult.totalStock, 10) || 0,
                                }];
                    }
                });
            });
        };
        return ProductsService_1;
    }());
    __setFunctionName(_classThis, "ProductsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductsService = _classThis;
}();
exports.ProductsService = ProductsService;
