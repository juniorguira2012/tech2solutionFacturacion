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
exports.Sale = void 0;
var typeorm_1 = require("typeorm");
var sale_item_entity_1 = require("./sale-item.entity");
var Sale = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('sales')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _cliente_decorators;
    var _cliente_initializers = [];
    var _cliente_extraInitializers = [];
    var _rnc_decorators;
    var _rnc_initializers = [];
    var _rnc_extraInitializers = [];
    var _subtotal_decorators;
    var _subtotal_initializers = [];
    var _subtotal_extraInitializers = [];
    var _descuento_decorators;
    var _descuento_initializers = [];
    var _descuento_extraInitializers = [];
    var _itbis_decorators;
    var _itbis_initializers = [];
    var _itbis_extraInitializers = [];
    var _total_decorators;
    var _total_initializers = [];
    var _total_extraInitializers = [];
    var _vendedorId_decorators;
    var _vendedorId_initializers = [];
    var _vendedorId_extraInitializers = [];
    var _items_decorators;
    var _items_initializers = [];
    var _items_extraInitializers = [];
    var _fecha_decorators;
    var _fecha_initializers = [];
    var _fecha_extraInitializers = [];
    var Sale = _classThis = /** @class */ (function () {
        function Sale_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.cliente = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _cliente_initializers, void 0));
            this.rnc = (__runInitializers(this, _cliente_extraInitializers), __runInitializers(this, _rnc_initializers, void 0));
            this.subtotal = (__runInitializers(this, _rnc_extraInitializers), __runInitializers(this, _subtotal_initializers, void 0));
            this.descuento = (__runInitializers(this, _subtotal_extraInitializers), __runInitializers(this, _descuento_initializers, void 0));
            this.itbis = (__runInitializers(this, _descuento_extraInitializers), __runInitializers(this, _itbis_initializers, void 0));
            this.total = (__runInitializers(this, _itbis_extraInitializers), __runInitializers(this, _total_initializers, void 0));
            this.vendedorId = (__runInitializers(this, _total_extraInitializers), __runInitializers(this, _vendedorId_initializers, void 0));
            this.items = (__runInitializers(this, _vendedorId_extraInitializers), __runInitializers(this, _items_initializers, void 0));
            this.fecha = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _fecha_initializers, void 0));
            __runInitializers(this, _fecha_extraInitializers);
        }
        return Sale_1;
    }());
    __setFunctionName(_classThis, "Sale");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _cliente_decorators = [(0, typeorm_1.Column)()];
        _rnc_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _subtotal_decorators = [(0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 })];
        _descuento_decorators = [(0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, default: 0 })];
        _itbis_decorators = [(0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 })];
        _total_decorators = [(0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 })];
        _vendedorId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _items_decorators = [(0, typeorm_1.OneToMany)(function () { return sale_item_entity_1.SaleItem; }, function (item) { return item.sale; }, { cascade: true })];
        _fecha_decorators = [(0, typeorm_1.CreateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _cliente_decorators, { kind: "field", name: "cliente", static: false, private: false, access: { has: function (obj) { return "cliente" in obj; }, get: function (obj) { return obj.cliente; }, set: function (obj, value) { obj.cliente = value; } }, metadata: _metadata }, _cliente_initializers, _cliente_extraInitializers);
        __esDecorate(null, null, _rnc_decorators, { kind: "field", name: "rnc", static: false, private: false, access: { has: function (obj) { return "rnc" in obj; }, get: function (obj) { return obj.rnc; }, set: function (obj, value) { obj.rnc = value; } }, metadata: _metadata }, _rnc_initializers, _rnc_extraInitializers);
        __esDecorate(null, null, _subtotal_decorators, { kind: "field", name: "subtotal", static: false, private: false, access: { has: function (obj) { return "subtotal" in obj; }, get: function (obj) { return obj.subtotal; }, set: function (obj, value) { obj.subtotal = value; } }, metadata: _metadata }, _subtotal_initializers, _subtotal_extraInitializers);
        __esDecorate(null, null, _descuento_decorators, { kind: "field", name: "descuento", static: false, private: false, access: { has: function (obj) { return "descuento" in obj; }, get: function (obj) { return obj.descuento; }, set: function (obj, value) { obj.descuento = value; } }, metadata: _metadata }, _descuento_initializers, _descuento_extraInitializers);
        __esDecorate(null, null, _itbis_decorators, { kind: "field", name: "itbis", static: false, private: false, access: { has: function (obj) { return "itbis" in obj; }, get: function (obj) { return obj.itbis; }, set: function (obj, value) { obj.itbis = value; } }, metadata: _metadata }, _itbis_initializers, _itbis_extraInitializers);
        __esDecorate(null, null, _total_decorators, { kind: "field", name: "total", static: false, private: false, access: { has: function (obj) { return "total" in obj; }, get: function (obj) { return obj.total; }, set: function (obj, value) { obj.total = value; } }, metadata: _metadata }, _total_initializers, _total_extraInitializers);
        __esDecorate(null, null, _vendedorId_decorators, { kind: "field", name: "vendedorId", static: false, private: false, access: { has: function (obj) { return "vendedorId" in obj; }, get: function (obj) { return obj.vendedorId; }, set: function (obj, value) { obj.vendedorId = value; } }, metadata: _metadata }, _vendedorId_initializers, _vendedorId_extraInitializers);
        __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: function (obj) { return "items" in obj; }, get: function (obj) { return obj.items; }, set: function (obj, value) { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
        __esDecorate(null, null, _fecha_decorators, { kind: "field", name: "fecha", static: false, private: false, access: { has: function (obj) { return "fecha" in obj; }, get: function (obj) { return obj.fecha; }, set: function (obj, value) { obj.fecha = value; } }, metadata: _metadata }, _fecha_initializers, _fecha_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Sale = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Sale = _classThis;
}();
exports.Sale = Sale;
