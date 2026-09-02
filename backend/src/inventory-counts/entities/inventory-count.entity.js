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
exports.InventoryCount = exports.ConteoEstado = void 0;
var typeorm_1 = require("typeorm");
var count_item_entity_1 = require("./count-item.entity");
var ConteoEstado;
(function (ConteoEstado) {
    ConteoEstado["EN_PROGRESO"] = "EN_PROGRESO";
    ConteoEstado["AJUSTES_PUBLICADOS"] = "Ajustes Publicados";
    ConteoEstado["CANCELADO"] = "CANCELADO";
})(ConteoEstado || (exports.ConteoEstado = ConteoEstado = {}));
var InventoryCount = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('inventory_counts')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _almacen_decorators;
    var _almacen_initializers = [];
    var _almacen_extraInitializers = [];
    var _descripcion_decorators;
    var _descripcion_initializers = [];
    var _descripcion_extraInitializers = [];
    var _estado_decorators;
    var _estado_initializers = [];
    var _estado_extraInitializers = [];
    var _totalProductos_decorators;
    var _totalProductos_initializers = [];
    var _totalProductos_extraInitializers = [];
    var _totalVariacion_decorators;
    var _totalVariacion_initializers = [];
    var _totalVariacion_extraInitializers = [];
    var _items_decorators;
    var _items_initializers = [];
    var _items_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var InventoryCount = _classThis = /** @class */ (function () {
        function InventoryCount_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.almacen = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _almacen_initializers, void 0));
            this.descripcion = (__runInitializers(this, _almacen_extraInitializers), __runInitializers(this, _descripcion_initializers, void 0));
            this.estado = (__runInitializers(this, _descripcion_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
            this.totalProductos = (__runInitializers(this, _estado_extraInitializers), __runInitializers(this, _totalProductos_initializers, void 0));
            this.totalVariacion = (__runInitializers(this, _totalProductos_extraInitializers), __runInitializers(this, _totalVariacion_initializers, void 0));
            this.items = (__runInitializers(this, _totalVariacion_extraInitializers), __runInitializers(this, _items_initializers, void 0));
            this.createdAt = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            __runInitializers(this, _createdAt_extraInitializers);
        }
        return InventoryCount_1;
    }());
    __setFunctionName(_classThis, "InventoryCount");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _almacen_decorators = [(0, typeorm_1.Column)()];
        _descripcion_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _estado_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: ConteoEstado,
                default: ConteoEstado.EN_PROGRESO,
            })];
        _totalProductos_decorators = [(0, typeorm_1.Column)({ type: 'int', default: 0 })];
        _totalVariacion_decorators = [(0, typeorm_1.Column)({ type: 'float', default: 0 })];
        _items_decorators = [(0, typeorm_1.OneToMany)(function () { return count_item_entity_1.CountItem; }, function (item) { return item.conteo; }, { cascade: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _almacen_decorators, { kind: "field", name: "almacen", static: false, private: false, access: { has: function (obj) { return "almacen" in obj; }, get: function (obj) { return obj.almacen; }, set: function (obj, value) { obj.almacen = value; } }, metadata: _metadata }, _almacen_initializers, _almacen_extraInitializers);
        __esDecorate(null, null, _descripcion_decorators, { kind: "field", name: "descripcion", static: false, private: false, access: { has: function (obj) { return "descripcion" in obj; }, get: function (obj) { return obj.descripcion; }, set: function (obj, value) { obj.descripcion = value; } }, metadata: _metadata }, _descripcion_initializers, _descripcion_extraInitializers);
        __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: function (obj) { return "estado" in obj; }, get: function (obj) { return obj.estado; }, set: function (obj, value) { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
        __esDecorate(null, null, _totalProductos_decorators, { kind: "field", name: "totalProductos", static: false, private: false, access: { has: function (obj) { return "totalProductos" in obj; }, get: function (obj) { return obj.totalProductos; }, set: function (obj, value) { obj.totalProductos = value; } }, metadata: _metadata }, _totalProductos_initializers, _totalProductos_extraInitializers);
        __esDecorate(null, null, _totalVariacion_decorators, { kind: "field", name: "totalVariacion", static: false, private: false, access: { has: function (obj) { return "totalVariacion" in obj; }, get: function (obj) { return obj.totalVariacion; }, set: function (obj, value) { obj.totalVariacion = value; } }, metadata: _metadata }, _totalVariacion_initializers, _totalVariacion_extraInitializers);
        __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: function (obj) { return "items" in obj; }, get: function (obj) { return obj.items; }, set: function (obj, value) { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InventoryCount = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InventoryCount = _classThis;
}();
exports.InventoryCount = InventoryCount;
