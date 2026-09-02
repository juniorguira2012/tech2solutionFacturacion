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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBulkMovementDto = exports.BulkMovementItemDto = void 0;
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var BulkMovementItemDto = function () {
    var _a;
    var _productoId_decorators;
    var _productoId_initializers = [];
    var _productoId_extraInitializers = [];
    var _cantidad_decorators;
    var _cantidad_initializers = [];
    var _cantidad_extraInitializers = [];
    var _almacen_decorators;
    var _almacen_initializers = [];
    var _almacen_extraInitializers = [];
    var _lote_decorators;
    var _lote_initializers = [];
    var _lote_extraInitializers = [];
    var _serials_decorators;
    var _serials_initializers = [];
    var _serials_extraInitializers = [];
    return _a = /** @class */ (function () {
            function BulkMovementItemDto() {
                this.productoId = __runInitializers(this, _productoId_initializers, void 0);
                this.cantidad = (__runInitializers(this, _productoId_extraInitializers), __runInitializers(this, _cantidad_initializers, void 0));
                this.almacen = (__runInitializers(this, _cantidad_extraInitializers), __runInitializers(this, _almacen_initializers, void 0));
                this.lote = (__runInitializers(this, _almacen_extraInitializers), __runInitializers(this, _lote_initializers, void 0));
                this.serials = (__runInitializers(this, _lote_extraInitializers), __runInitializers(this, _serials_initializers, void 0));
                __runInitializers(this, _serials_extraInitializers);
            }
            return BulkMovementItemDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productoId_decorators = [(0, class_validator_1.IsInt)()];
            _cantidad_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _almacen_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _lote_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _serials_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            __esDecorate(null, null, _productoId_decorators, { kind: "field", name: "productoId", static: false, private: false, access: { has: function (obj) { return "productoId" in obj; }, get: function (obj) { return obj.productoId; }, set: function (obj, value) { obj.productoId = value; } }, metadata: _metadata }, _productoId_initializers, _productoId_extraInitializers);
            __esDecorate(null, null, _cantidad_decorators, { kind: "field", name: "cantidad", static: false, private: false, access: { has: function (obj) { return "cantidad" in obj; }, get: function (obj) { return obj.cantidad; }, set: function (obj, value) { obj.cantidad = value; } }, metadata: _metadata }, _cantidad_initializers, _cantidad_extraInitializers);
            __esDecorate(null, null, _almacen_decorators, { kind: "field", name: "almacen", static: false, private: false, access: { has: function (obj) { return "almacen" in obj; }, get: function (obj) { return obj.almacen; }, set: function (obj, value) { obj.almacen = value; } }, metadata: _metadata }, _almacen_initializers, _almacen_extraInitializers);
            __esDecorate(null, null, _lote_decorators, { kind: "field", name: "lote", static: false, private: false, access: { has: function (obj) { return "lote" in obj; }, get: function (obj) { return obj.lote; }, set: function (obj, value) { obj.lote = value; } }, metadata: _metadata }, _lote_initializers, _lote_extraInitializers);
            __esDecorate(null, null, _serials_decorators, { kind: "field", name: "serials", static: false, private: false, access: { has: function (obj) { return "serials" in obj; }, get: function (obj) { return obj.serials; }, set: function (obj, value) { obj.serials = value; } }, metadata: _metadata }, _serials_initializers, _serials_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.BulkMovementItemDto = BulkMovementItemDto;
var CreateBulkMovementDto = function () {
    var _a;
    var _tipo_decorators;
    var _tipo_initializers = [];
    var _tipo_extraInitializers = [];
    var _nota_decorators;
    var _nota_initializers = [];
    var _nota_extraInitializers = [];
    var _items_decorators;
    var _items_initializers = [];
    var _items_extraInitializers = [];
    var _usuarioId_decorators;
    var _usuarioId_initializers = [];
    var _usuarioId_extraInitializers = [];
    var _referencia_decorators;
    var _referencia_initializers = [];
    var _referencia_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateBulkMovementDto() {
                this.tipo = __runInitializers(this, _tipo_initializers, void 0);
                this.nota = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _nota_initializers, void 0));
                this.items = (__runInitializers(this, _nota_extraInitializers), __runInitializers(this, _items_initializers, void 0));
                this.usuarioId = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _usuarioId_initializers, void 0));
                this.referencia = (__runInitializers(this, _usuarioId_extraInitializers), __runInitializers(this, _referencia_initializers, void 0));
                __runInitializers(this, _referencia_extraInitializers);
            }
            return CreateBulkMovementDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _tipo_decorators = [(0, class_validator_1.IsString)()];
            _nota_decorators = [(0, class_validator_1.IsString)()];
            _items_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(function () { return BulkMovementItemDto; })];
            _usuarioId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)()];
            _referencia_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: function (obj) { return "tipo" in obj; }, get: function (obj) { return obj.tipo; }, set: function (obj, value) { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
            __esDecorate(null, null, _nota_decorators, { kind: "field", name: "nota", static: false, private: false, access: { has: function (obj) { return "nota" in obj; }, get: function (obj) { return obj.nota; }, set: function (obj, value) { obj.nota = value; } }, metadata: _metadata }, _nota_initializers, _nota_extraInitializers);
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: function (obj) { return "items" in obj; }, get: function (obj) { return obj.items; }, set: function (obj, value) { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            __esDecorate(null, null, _usuarioId_decorators, { kind: "field", name: "usuarioId", static: false, private: false, access: { has: function (obj) { return "usuarioId" in obj; }, get: function (obj) { return obj.usuarioId; }, set: function (obj, value) { obj.usuarioId = value; } }, metadata: _metadata }, _usuarioId_initializers, _usuarioId_extraInitializers);
            __esDecorate(null, null, _referencia_decorators, { kind: "field", name: "referencia", static: false, private: false, access: { has: function (obj) { return "referencia" in obj; }, get: function (obj) { return obj.referencia; }, set: function (obj, value) { obj.referencia = value; } }, metadata: _metadata }, _referencia_initializers, _referencia_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateBulkMovementDto = CreateBulkMovementDto;
