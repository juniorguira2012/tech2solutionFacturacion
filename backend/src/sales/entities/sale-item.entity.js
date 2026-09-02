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
exports.SaleItem = void 0;
var typeorm_1 = require("typeorm");
var sale_entity_1 = require("./sale.entity");
var SaleItem = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('sale_items')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _saleId_decorators;
    var _saleId_initializers = [];
    var _saleId_extraInitializers = [];
    var _sale_decorators;
    var _sale_initializers = [];
    var _sale_extraInitializers = [];
    var _productoId_decorators;
    var _productoId_initializers = [];
    var _productoId_extraInitializers = [];
    var _cantidad_decorators;
    var _cantidad_initializers = [];
    var _cantidad_extraInitializers = [];
    var _precio_decorators;
    var _precio_initializers = [];
    var _precio_extraInitializers = [];
    var SaleItem = _classThis = /** @class */ (function () {
        function SaleItem_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.saleId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _saleId_initializers, void 0));
            this.sale = (__runInitializers(this, _saleId_extraInitializers), __runInitializers(this, _sale_initializers, void 0));
            this.productoId = (__runInitializers(this, _sale_extraInitializers), __runInitializers(this, _productoId_initializers, void 0));
            this.cantidad = (__runInitializers(this, _productoId_extraInitializers), __runInitializers(this, _cantidad_initializers, void 0));
            this.precio = (__runInitializers(this, _cantidad_extraInitializers), __runInitializers(this, _precio_initializers, void 0));
            __runInitializers(this, _precio_extraInitializers);
        }
        return SaleItem_1;
    }());
    __setFunctionName(_classThis, "SaleItem");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _saleId_decorators = [(0, typeorm_1.Column)()];
        _sale_decorators = [(0, typeorm_1.ManyToOne)(function () { return sale_entity_1.Sale; }, function (sale) { return sale.items; }), (0, typeorm_1.JoinColumn)({ name: 'saleId' })];
        _productoId_decorators = [(0, typeorm_1.Column)()];
        _cantidad_decorators = [(0, typeorm_1.Column)()];
        _precio_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _saleId_decorators, { kind: "field", name: "saleId", static: false, private: false, access: { has: function (obj) { return "saleId" in obj; }, get: function (obj) { return obj.saleId; }, set: function (obj, value) { obj.saleId = value; } }, metadata: _metadata }, _saleId_initializers, _saleId_extraInitializers);
        __esDecorate(null, null, _sale_decorators, { kind: "field", name: "sale", static: false, private: false, access: { has: function (obj) { return "sale" in obj; }, get: function (obj) { return obj.sale; }, set: function (obj, value) { obj.sale = value; } }, metadata: _metadata }, _sale_initializers, _sale_extraInitializers);
        __esDecorate(null, null, _productoId_decorators, { kind: "field", name: "productoId", static: false, private: false, access: { has: function (obj) { return "productoId" in obj; }, get: function (obj) { return obj.productoId; }, set: function (obj, value) { obj.productoId = value; } }, metadata: _metadata }, _productoId_initializers, _productoId_extraInitializers);
        __esDecorate(null, null, _cantidad_decorators, { kind: "field", name: "cantidad", static: false, private: false, access: { has: function (obj) { return "cantidad" in obj; }, get: function (obj) { return obj.cantidad; }, set: function (obj, value) { obj.cantidad = value; } }, metadata: _metadata }, _cantidad_initializers, _cantidad_extraInitializers);
        __esDecorate(null, null, _precio_decorators, { kind: "field", name: "precio", static: false, private: false, access: { has: function (obj) { return "precio" in obj; }, get: function (obj) { return obj.precio; }, set: function (obj, value) { obj.precio = value; } }, metadata: _metadata }, _precio_initializers, _precio_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SaleItem = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SaleItem = _classThis;
}();
exports.SaleItem = SaleItem;
