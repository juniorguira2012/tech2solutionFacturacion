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
exports.InventoryCountItem = void 0;
var typeorm_1 = require("typeorm");
var inventory_count_entity_1 = require("./inventory-count.entity");
var InventoryCountItem = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('inventory_count_items')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _productoId_decorators;
    var _productoId_initializers = [];
    var _productoId_extraInitializers = [];
    var _productoNombre_decorators;
    var _productoNombre_initializers = [];
    var _productoNombre_extraInitializers = [];
    var _codigo_decorators;
    var _codigo_initializers = [];
    var _codigo_extraInitializers = [];
    var _cantidadContada_decorators;
    var _cantidadContada_initializers = [];
    var _cantidadContada_extraInitializers = [];
    var _cantidadSistema_decorators;
    var _cantidadSistema_initializers = [];
    var _cantidadSistema_extraInitializers = [];
    var _precioUnitario_decorators;
    var _precioUnitario_initializers = [];
    var _precioUnitario_extraInitializers = [];
    var _unidadMedida_decorators;
    var _unidadMedida_initializers = [];
    var _unidadMedida_extraInitializers = [];
    var _diferencia_decorators;
    var _diferencia_initializers = [];
    var _diferencia_extraInitializers = [];
    var _costoVariacion_decorators;
    var _costoVariacion_initializers = [];
    var _costoVariacion_extraInitializers = [];
    var _inventoryCount_decorators;
    var _inventoryCount_initializers = [];
    var _inventoryCount_extraInitializers = [];
    var InventoryCountItem = _classThis = /** @class */ (function () {
        function InventoryCountItem_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.productoId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _productoId_initializers, void 0));
            this.productoNombre = (__runInitializers(this, _productoId_extraInitializers), __runInitializers(this, _productoNombre_initializers, void 0));
            this.codigo = (__runInitializers(this, _productoNombre_extraInitializers), __runInitializers(this, _codigo_initializers, void 0));
            this.cantidadContada = (__runInitializers(this, _codigo_extraInitializers), __runInitializers(this, _cantidadContada_initializers, void 0));
            this.cantidadSistema = (__runInitializers(this, _cantidadContada_extraInitializers), __runInitializers(this, _cantidadSistema_initializers, void 0));
            this.precioUnitario = (__runInitializers(this, _cantidadSistema_extraInitializers), __runInitializers(this, _precioUnitario_initializers, void 0));
            this.unidadMedida = (__runInitializers(this, _precioUnitario_extraInitializers), __runInitializers(this, _unidadMedida_initializers, void 0));
            this.diferencia = (__runInitializers(this, _unidadMedida_extraInitializers), __runInitializers(this, _diferencia_initializers, void 0));
            this.costoVariacion = (__runInitializers(this, _diferencia_extraInitializers), __runInitializers(this, _costoVariacion_initializers, void 0));
            this.inventoryCount = (__runInitializers(this, _costoVariacion_extraInitializers), __runInitializers(this, _inventoryCount_initializers, void 0));
            __runInitializers(this, _inventoryCount_extraInitializers);
        }
        return InventoryCountItem_1;
    }());
    __setFunctionName(_classThis, "InventoryCountItem");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _productoId_decorators = [(0, typeorm_1.Column)()];
        _productoNombre_decorators = [(0, typeorm_1.Column)()];
        _codigo_decorators = [(0, typeorm_1.Column)()];
        _cantidadContada_decorators = [(0, typeorm_1.Column)({ type: 'float', default: 0 })];
        _cantidadSistema_decorators = [(0, typeorm_1.Column)({ type: 'float', default: 0 })];
        _precioUnitario_decorators = [(0, typeorm_1.Column)({ type: 'float', default: 0 })];
        _unidadMedida_decorators = [(0, typeorm_1.Column)({ default: 'Unidad' })];
        _diferencia_decorators = [(0, typeorm_1.Column)({ type: 'float', default: 0 })];
        _costoVariacion_decorators = [(0, typeorm_1.Column)({ type: 'float', default: 0 })];
        _inventoryCount_decorators = [(0, typeorm_1.ManyToOne)(function () { return inventory_count_entity_1.InventoryCount; }, function (count) { return count.items; }, { onDelete: 'CASCADE' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _productoId_decorators, { kind: "field", name: "productoId", static: false, private: false, access: { has: function (obj) { return "productoId" in obj; }, get: function (obj) { return obj.productoId; }, set: function (obj, value) { obj.productoId = value; } }, metadata: _metadata }, _productoId_initializers, _productoId_extraInitializers);
        __esDecorate(null, null, _productoNombre_decorators, { kind: "field", name: "productoNombre", static: false, private: false, access: { has: function (obj) { return "productoNombre" in obj; }, get: function (obj) { return obj.productoNombre; }, set: function (obj, value) { obj.productoNombre = value; } }, metadata: _metadata }, _productoNombre_initializers, _productoNombre_extraInitializers);
        __esDecorate(null, null, _codigo_decorators, { kind: "field", name: "codigo", static: false, private: false, access: { has: function (obj) { return "codigo" in obj; }, get: function (obj) { return obj.codigo; }, set: function (obj, value) { obj.codigo = value; } }, metadata: _metadata }, _codigo_initializers, _codigo_extraInitializers);
        __esDecorate(null, null, _cantidadContada_decorators, { kind: "field", name: "cantidadContada", static: false, private: false, access: { has: function (obj) { return "cantidadContada" in obj; }, get: function (obj) { return obj.cantidadContada; }, set: function (obj, value) { obj.cantidadContada = value; } }, metadata: _metadata }, _cantidadContada_initializers, _cantidadContada_extraInitializers);
        __esDecorate(null, null, _cantidadSistema_decorators, { kind: "field", name: "cantidadSistema", static: false, private: false, access: { has: function (obj) { return "cantidadSistema" in obj; }, get: function (obj) { return obj.cantidadSistema; }, set: function (obj, value) { obj.cantidadSistema = value; } }, metadata: _metadata }, _cantidadSistema_initializers, _cantidadSistema_extraInitializers);
        __esDecorate(null, null, _precioUnitario_decorators, { kind: "field", name: "precioUnitario", static: false, private: false, access: { has: function (obj) { return "precioUnitario" in obj; }, get: function (obj) { return obj.precioUnitario; }, set: function (obj, value) { obj.precioUnitario = value; } }, metadata: _metadata }, _precioUnitario_initializers, _precioUnitario_extraInitializers);
        __esDecorate(null, null, _unidadMedida_decorators, { kind: "field", name: "unidadMedida", static: false, private: false, access: { has: function (obj) { return "unidadMedida" in obj; }, get: function (obj) { return obj.unidadMedida; }, set: function (obj, value) { obj.unidadMedida = value; } }, metadata: _metadata }, _unidadMedida_initializers, _unidadMedida_extraInitializers);
        __esDecorate(null, null, _diferencia_decorators, { kind: "field", name: "diferencia", static: false, private: false, access: { has: function (obj) { return "diferencia" in obj; }, get: function (obj) { return obj.diferencia; }, set: function (obj, value) { obj.diferencia = value; } }, metadata: _metadata }, _diferencia_initializers, _diferencia_extraInitializers);
        __esDecorate(null, null, _costoVariacion_decorators, { kind: "field", name: "costoVariacion", static: false, private: false, access: { has: function (obj) { return "costoVariacion" in obj; }, get: function (obj) { return obj.costoVariacion; }, set: function (obj, value) { obj.costoVariacion = value; } }, metadata: _metadata }, _costoVariacion_initializers, _costoVariacion_extraInitializers);
        __esDecorate(null, null, _inventoryCount_decorators, { kind: "field", name: "inventoryCount", static: false, private: false, access: { has: function (obj) { return "inventoryCount" in obj; }, get: function (obj) { return obj.inventoryCount; }, set: function (obj, value) { obj.inventoryCount = value; } }, metadata: _metadata }, _inventoryCount_initializers, _inventoryCount_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InventoryCountItem = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InventoryCountItem = _classThis;
}();
exports.InventoryCountItem = InventoryCountItem;
