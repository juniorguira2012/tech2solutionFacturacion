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
exports.ProductSerialsService = void 0;
var common_1 = require("@nestjs/common");
var product_serial_entity_1 = require("./entities/product-serial.entity");
var product_entity_1 = require("./entities/product.entity");
var ProductSerialsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ProductSerialsService = _classThis = /** @class */ (function () {
        function ProductSerialsService_1(serialRepository, productRepository, dataSource) {
            this.serialRepository = serialRepository;
            this.productRepository = productRepository;
            this.dataSource = dataSource;
        }
        ProductSerialsService_1.prototype.findAll = function () {
            return this.serialRepository.find({
                relations: ['producto'],
                order: { createdAt: 'DESC' },
            });
        };
        ProductSerialsService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var serial;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.serialRepository.findOne({
                                where: { id: id },
                                relations: ['producto'],
                            })];
                        case 1:
                            serial = _a.sent();
                            if (!serial) {
                                throw new common_1.NotFoundException("Serial con ID ".concat(id, " no encontrado."));
                            }
                            return [2 /*return*/, serial];
                    }
                });
            });
        };
        ProductSerialsService_1.prototype.findByProductId = function (productId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.serialRepository.find({
                            where: { productoId: productId },
                            relations: ['producto'],
                            order: { createdAt: 'DESC' },
                        })];
                });
            });
        };
        ProductSerialsService_1.prototype.updateSerialNumber = function (id, updateDto) {
            return __awaiter(this, void 0, void 0, function () {
                var newSerialNumber, queryRunner, serial, existingSerial, updatedSerial, error_1;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            newSerialNumber = (_a = updateDto.serialNumber) === null || _a === void 0 ? void 0 : _a.trim();
                            if (!newSerialNumber) {
                                throw new common_1.BadRequestException('El número de serie no puede estar vacío.');
                            }
                            queryRunner = this.dataSource.createQueryRunner();
                            return [4 /*yield*/, queryRunner.connect()];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, queryRunner.startTransaction()];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 8, 10, 12]);
                            return [4 /*yield*/, queryRunner.manager.findOne(product_serial_entity_1.ProductSerial, { where: { id: id } })];
                        case 4:
                            serial = _b.sent();
                            if (!serial) {
                                throw new common_1.NotFoundException("Serial con ID ".concat(id, " no encontrado."));
                            }
                            if (serial.status !== product_serial_entity_1.SerialStatus.DISPONIBLE) {
                                throw new common_1.BadRequestException("No se puede modificar el serial. Su estado es '".concat(serial.status, "'."));
                            }
                            return [4 /*yield*/, queryRunner.manager.findOne(product_serial_entity_1.ProductSerial, {
                                    where: { serialNumber: newSerialNumber, productoId: serial.productoId },
                                })];
                        case 5:
                            existingSerial = _b.sent();
                            if (existingSerial && existingSerial.id !== id) {
                                throw new common_1.BadRequestException("El serial '".concat(newSerialNumber, "' ya existe para este producto."));
                            }
                            serial.serialNumber = newSerialNumber;
                            return [4 /*yield*/, queryRunner.manager.save(product_serial_entity_1.ProductSerial, serial)];
                        case 6:
                            updatedSerial = _b.sent();
                            return [4 /*yield*/, queryRunner.commitTransaction()];
                        case 7:
                            _b.sent();
                            return [2 /*return*/, updatedSerial];
                        case 8:
                            error_1 = _b.sent();
                            return [4 /*yield*/, queryRunner.rollbackTransaction()];
                        case 9:
                            _b.sent();
                            throw error_1;
                        case 10: return [4 /*yield*/, queryRunner.release()];
                        case 11:
                            _b.sent();
                            return [7 /*endfinally*/];
                        case 12: return [2 /*return*/];
                    }
                });
            });
        };
        ProductSerialsService_1.prototype.updateStatus = function (id, status) {
            return __awaiter(this, void 0, void 0, function () {
                var queryRunner, serial, serialActualizado, nuevoStockDisponible, error_2;
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
                            _a.trys.push([3, 9, 11, 13]);
                            return [4 /*yield*/, queryRunner.manager.findOne(product_serial_entity_1.ProductSerial, {
                                    where: { id: id },
                                    relations: ['producto'],
                                })];
                        case 4:
                            serial = _a.sent();
                            if (!serial) {
                                throw new common_1.NotFoundException("Serial con ID ".concat(id, " no encontrado."));
                            }
                            serial.status = status;
                            return [4 /*yield*/, queryRunner.manager.save(product_serial_entity_1.ProductSerial, serial)];
                        case 5:
                            serialActualizado = _a.sent();
                            return [4 /*yield*/, queryRunner.manager.count(product_serial_entity_1.ProductSerial, {
                                    where: { productoId: serial.productoId, status: product_serial_entity_1.SerialStatus.DISPONIBLE },
                                })];
                        case 6:
                            nuevoStockDisponible = _a.sent();
                            return [4 /*yield*/, queryRunner.manager.update(product_entity_1.Product, serial.productoId, { stock: nuevoStockDisponible })];
                        case 7:
                            _a.sent();
                            // --- FIN: Lógica de sincronización ---
                            return [4 /*yield*/, queryRunner.commitTransaction()];
                        case 8:
                            // --- FIN: Lógica de sincronización ---
                            _a.sent();
                            return [2 /*return*/, serialActualizado];
                        case 9:
                            error_2 = _a.sent();
                            return [4 /*yield*/, queryRunner.rollbackTransaction()];
                        case 10:
                            _a.sent();
                            throw error_2;
                        case 11: return [4 /*yield*/, queryRunner.release()];
                        case 12:
                            _a.sent();
                            return [7 /*endfinally*/];
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        return ProductSerialsService_1;
    }());
    __setFunctionName(_classThis, "ProductSerialsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductSerialsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductSerialsService = _classThis;
}();
exports.ProductSerialsService = ProductSerialsService;
