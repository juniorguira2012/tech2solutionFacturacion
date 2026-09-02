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
exports.ProductSerial = exports.SerialStatus = void 0;
var typeorm_1 = require("typeorm");
var product_entity_1 = require("./product.entity");
var SerialStatus;
(function (SerialStatus) {
    SerialStatus["DISPONIBLE"] = "disponible";
    SerialStatus["VENDIDO"] = "vendido";
    SerialStatus["EN_REPARACION"] = "en_reparacion";
    SerialStatus["DESCARTADO"] = "descartado";
    SerialStatus["EN_COMODATO"] = "en_comodato";
    SerialStatus["ASIGNADO_TECNICO"] = "asignado_tecnico";
})(SerialStatus || (exports.SerialStatus = SerialStatus = {}));
var ProductSerial = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('product_serials'), (0, typeorm_1.Index)(['serialNumber', 'productoId'], { unique: true })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _serialNumber_decorators;
    var _serialNumber_initializers = [];
    var _serialNumber_extraInitializers = [];
    var _producto_decorators;
    var _producto_initializers = [];
    var _producto_extraInitializers = [];
    var _productoId_decorators;
    var _productoId_initializers = [];
    var _productoId_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _almacen_decorators;
    var _almacen_initializers = [];
    var _almacen_extraInitializers = [];
    var _nota_decorators;
    var _nota_initializers = [];
    var _nota_extraInitializers = [];
    var _lastReturnNote_decorators;
    var _lastReturnNote_initializers = [];
    var _lastReturnNote_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var ProductSerial = _classThis = /** @class */ (function () {
        function ProductSerial_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.serialNumber = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _serialNumber_initializers, void 0));
            this.producto = (__runInitializers(this, _serialNumber_extraInitializers), __runInitializers(this, _producto_initializers, void 0));
            this.productoId = (__runInitializers(this, _producto_extraInitializers), __runInitializers(this, _productoId_initializers, void 0));
            this.status = (__runInitializers(this, _productoId_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.almacen = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _almacen_initializers, void 0));
            // 🌟 CORRECCIÓN: Columna para registrar notas generales o motivos de asignación
            this.nota = (__runInitializers(this, _almacen_extraInitializers), __runInitializers(this, _nota_initializers, void 0));
            // 🌟 CORRECCIÓN: Columna requerida por el MovementsService para mitigar el error TS2339
            this.lastReturnNote = (__runInitializers(this, _nota_extraInitializers), __runInitializers(this, _lastReturnNote_initializers, void 0));
            this.createdAt = (__runInitializers(this, _lastReturnNote_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
        return ProductSerial_1;
    }());
    __setFunctionName(_classThis, "ProductSerial");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _serialNumber_decorators = [(0, typeorm_1.Column)({ length: 100 })];
        _producto_decorators = [(0, typeorm_1.ManyToOne)(function () { return product_entity_1.Product; }, function (product) { return product.seriales; }, { onDelete: 'CASCADE', nullable: false }), (0, typeorm_1.JoinColumn)({ name: 'productoId' })];
        _productoId_decorators = [(0, typeorm_1.Column)()];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: SerialStatus, default: SerialStatus.DISPONIBLE })];
        _almacen_decorators = [(0, typeorm_1.Column)({ length: 100, comment: 'Almacén donde se encuentra físicamente el serial' })];
        _nota_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true, comment: 'Nota general o de entrega del serial' })];
        _lastReturnNote_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true, comment: 'Última nota de devolución registrada por el técnico' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _serialNumber_decorators, { kind: "field", name: "serialNumber", static: false, private: false, access: { has: function (obj) { return "serialNumber" in obj; }, get: function (obj) { return obj.serialNumber; }, set: function (obj, value) { obj.serialNumber = value; } }, metadata: _metadata }, _serialNumber_initializers, _serialNumber_extraInitializers);
        __esDecorate(null, null, _producto_decorators, { kind: "field", name: "producto", static: false, private: false, access: { has: function (obj) { return "producto" in obj; }, get: function (obj) { return obj.producto; }, set: function (obj, value) { obj.producto = value; } }, metadata: _metadata }, _producto_initializers, _producto_extraInitializers);
        __esDecorate(null, null, _productoId_decorators, { kind: "field", name: "productoId", static: false, private: false, access: { has: function (obj) { return "productoId" in obj; }, get: function (obj) { return obj.productoId; }, set: function (obj, value) { obj.productoId = value; } }, metadata: _metadata }, _productoId_initializers, _productoId_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _almacen_decorators, { kind: "field", name: "almacen", static: false, private: false, access: { has: function (obj) { return "almacen" in obj; }, get: function (obj) { return obj.almacen; }, set: function (obj, value) { obj.almacen = value; } }, metadata: _metadata }, _almacen_initializers, _almacen_extraInitializers);
        __esDecorate(null, null, _nota_decorators, { kind: "field", name: "nota", static: false, private: false, access: { has: function (obj) { return "nota" in obj; }, get: function (obj) { return obj.nota; }, set: function (obj, value) { obj.nota = value; } }, metadata: _metadata }, _nota_initializers, _nota_extraInitializers);
        __esDecorate(null, null, _lastReturnNote_decorators, { kind: "field", name: "lastReturnNote", static: false, private: false, access: { has: function (obj) { return "lastReturnNote" in obj; }, get: function (obj) { return obj.lastReturnNote; }, set: function (obj, value) { obj.lastReturnNote = value; } }, metadata: _metadata }, _lastReturnNote_initializers, _lastReturnNote_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductSerial = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductSerial = _classThis;
}();
exports.ProductSerial = ProductSerial;
