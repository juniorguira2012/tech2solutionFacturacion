"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.MovementsController = void 0;
var common_1 = require("@nestjs/common"); // 🚨 Se agregó 'Req' aquí
var MovementsController = function () {
    var _classDecorators = [(0, common_1.Controller)('movements')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _create_decorators;
    var _transferBulk_decorators;
    var _createBulk_decorators;
    var _assignToTechnician_decorators;
    var _returnFromTechnician_decorators;
    var _findTechnicians_decorators;
    var _createTechnician_decorators;
    var _updateTechnician_decorators;
    var _deleteTechnician_decorators;
    var _findAll_decorators;
    var _findByProduct_decorators;
    var _findBySerialNumber_decorators;
    var MovementsController = _classThis = /** @class */ (function () {
        function MovementsController_1(movementsService) {
            this.movementsService = (__runInitializers(this, _instanceExtraInitializers), movementsService);
        }
        MovementsController_1.prototype.create = function (createMovementDto) {
            return this.movementsService.create(createMovementDto);
        };
        MovementsController_1.prototype.transferBulk = function (transferData) {
            return this.movementsService.transferBulk(transferData);
        };
        MovementsController_1.prototype.createBulk = function (bulkData) {
            return this.movementsService.createBulk(bulkData);
        };
        MovementsController_1.prototype.assignToTechnician = function (assignData) {
            return this.movementsService.assignSerialsToTechnician(assignData);
        };
        // 🚀 RUTA REPARADA PARA COINCIDIR CON LA FIRMA DEL SERVICIO
        MovementsController_1.prototype.returnFromTechnician = function (payload) {
            // 🌟 CORRECCIÓN: Si no viene un usuarioId del front, usamos '1' por defecto
            // para evitar el error "user is not defined"
            var userId = payload.usuarioId || '1';
            return this.movementsService.returnSerialFromTechnician({ serialNumber: payload.serialNumber, nota: payload.nota }, String(userId));
        };
        MovementsController_1.prototype.findTechnicians = function () {
            return this.movementsService.findTechnicians();
        };
        MovementsController_1.prototype.createTechnician = function (payload) {
            return this.movementsService.createTechnician(payload);
        };
        MovementsController_1.prototype.updateTechnician = function (id, payload) {
            return this.movementsService.updateTechnician(id, payload);
        };
        MovementsController_1.prototype.deleteTechnician = function (id) {
            return this.movementsService.deleteTechnician(id);
        };
        MovementsController_1.prototype.findAll = function (productoId) {
            if (productoId) {
                return this.movementsService.findByProductId(Number(productoId));
            }
            return this.movementsService.findAll();
        };
        MovementsController_1.prototype.findByProduct = function (id) {
            return this.movementsService.findByProductId(id);
        };
        MovementsController_1.prototype.findBySerialNumber = function (serialNumber) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!serialNumber) {
                        throw new common_1.NotFoundException('Número de serial no proporcionado.');
                    }
                    return [2 /*return*/, this.movementsService.findBySerialNumber(serialNumber)];
                });
            });
        };
        return MovementsController_1;
    }());
    __setFunctionName(_classThis, "MovementsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [(0, common_1.Post)()];
        _transferBulk_decorators = [(0, common_1.Post)('transfer')];
        _createBulk_decorators = [(0, common_1.Post)('bulk-receive')];
        _assignToTechnician_decorators = [(0, common_1.Post)('assign-to-technician')];
        _returnFromTechnician_decorators = [(0, common_1.Post)('return-from-technician')];
        _findTechnicians_decorators = [(0, common_1.Get)('technicians')];
        _createTechnician_decorators = [(0, common_1.Post)('technicians')];
        _updateTechnician_decorators = [(0, common_1.Patch)('technicians/:id')];
        _deleteTechnician_decorators = [(0, common_1.Delete)('technicians/:id')];
        _findAll_decorators = [(0, common_1.Get)()];
        _findByProduct_decorators = [(0, common_1.Get)('product/:id')];
        _findBySerialNumber_decorators = [(0, common_1.Get)('by-serial/:serialNumber')];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _transferBulk_decorators, { kind: "method", name: "transferBulk", static: false, private: false, access: { has: function (obj) { return "transferBulk" in obj; }, get: function (obj) { return obj.transferBulk; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createBulk_decorators, { kind: "method", name: "createBulk", static: false, private: false, access: { has: function (obj) { return "createBulk" in obj; }, get: function (obj) { return obj.createBulk; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _assignToTechnician_decorators, { kind: "method", name: "assignToTechnician", static: false, private: false, access: { has: function (obj) { return "assignToTechnician" in obj; }, get: function (obj) { return obj.assignToTechnician; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _returnFromTechnician_decorators, { kind: "method", name: "returnFromTechnician", static: false, private: false, access: { has: function (obj) { return "returnFromTechnician" in obj; }, get: function (obj) { return obj.returnFromTechnician; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findTechnicians_decorators, { kind: "method", name: "findTechnicians", static: false, private: false, access: { has: function (obj) { return "findTechnicians" in obj; }, get: function (obj) { return obj.findTechnicians; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createTechnician_decorators, { kind: "method", name: "createTechnician", static: false, private: false, access: { has: function (obj) { return "createTechnician" in obj; }, get: function (obj) { return obj.createTechnician; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateTechnician_decorators, { kind: "method", name: "updateTechnician", static: false, private: false, access: { has: function (obj) { return "updateTechnician" in obj; }, get: function (obj) { return obj.updateTechnician; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteTechnician_decorators, { kind: "method", name: "deleteTechnician", static: false, private: false, access: { has: function (obj) { return "deleteTechnician" in obj; }, get: function (obj) { return obj.deleteTechnician; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByProduct_decorators, { kind: "method", name: "findByProduct", static: false, private: false, access: { has: function (obj) { return "findByProduct" in obj; }, get: function (obj) { return obj.findByProduct; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findBySerialNumber_decorators, { kind: "method", name: "findBySerialNumber", static: false, private: false, access: { has: function (obj) { return "findBySerialNumber" in obj; }, get: function (obj) { return obj.findBySerialNumber; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MovementsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MovementsController = _classThis;
}();
exports.MovementsController = MovementsController;
