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
exports.CreateInventoryBatchDto = void 0;
var class_validator_1 = require("class-validator");
var CreateInventoryBatchDto = function () {
    var _a;
    var _productoId_decorators;
    var _productoId_initializers = [];
    var _productoId_extraInitializers = [];
    var _numeroLote_decorators;
    var _numeroLote_initializers = [];
    var _numeroLote_extraInitializers = [];
    var _cantidad_decorators;
    var _cantidad_initializers = [];
    var _cantidad_extraInitializers = [];
    var _almacen_decorators;
    var _almacen_initializers = [];
    var _almacen_extraInitializers = [];
    var _fechaVencimiento_decorators;
    var _fechaVencimiento_initializers = [];
    var _fechaVencimiento_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateInventoryBatchDto() {
                this.productoId = __runInitializers(this, _productoId_initializers, void 0);
                this.numeroLote = (__runInitializers(this, _productoId_extraInitializers), __runInitializers(this, _numeroLote_initializers, void 0));
                this.cantidad = (__runInitializers(this, _numeroLote_extraInitializers), __runInitializers(this, _cantidad_initializers, void 0));
                this.almacen = (__runInitializers(this, _cantidad_extraInitializers), __runInitializers(this, _almacen_initializers, void 0));
                this.fechaVencimiento = (__runInitializers(this, _almacen_extraInitializers), __runInitializers(this, _fechaVencimiento_initializers, void 0));
                __runInitializers(this, _fechaVencimiento_extraInitializers);
            }
            return CreateInventoryBatchDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productoId_decorators = [(0, class_validator_1.IsInt)()];
            _numeroLote_decorators = [(0, class_validator_1.IsString)()];
            _cantidad_decorators = [(0, class_validator_1.IsNumber)()];
            _almacen_decorators = [(0, class_validator_1.IsString)()];
            _fechaVencimiento_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            __esDecorate(null, null, _productoId_decorators, { kind: "field", name: "productoId", static: false, private: false, access: { has: function (obj) { return "productoId" in obj; }, get: function (obj) { return obj.productoId; }, set: function (obj, value) { obj.productoId = value; } }, metadata: _metadata }, _productoId_initializers, _productoId_extraInitializers);
            __esDecorate(null, null, _numeroLote_decorators, { kind: "field", name: "numeroLote", static: false, private: false, access: { has: function (obj) { return "numeroLote" in obj; }, get: function (obj) { return obj.numeroLote; }, set: function (obj, value) { obj.numeroLote = value; } }, metadata: _metadata }, _numeroLote_initializers, _numeroLote_extraInitializers);
            __esDecorate(null, null, _cantidad_decorators, { kind: "field", name: "cantidad", static: false, private: false, access: { has: function (obj) { return "cantidad" in obj; }, get: function (obj) { return obj.cantidad; }, set: function (obj, value) { obj.cantidad = value; } }, metadata: _metadata }, _cantidad_initializers, _cantidad_extraInitializers);
            __esDecorate(null, null, _almacen_decorators, { kind: "field", name: "almacen", static: false, private: false, access: { has: function (obj) { return "almacen" in obj; }, get: function (obj) { return obj.almacen; }, set: function (obj, value) { obj.almacen = value; } }, metadata: _metadata }, _almacen_initializers, _almacen_extraInitializers);
            __esDecorate(null, null, _fechaVencimiento_decorators, { kind: "field", name: "fechaVencimiento", static: false, private: false, access: { has: function (obj) { return "fechaVencimiento" in obj; }, get: function (obj) { return obj.fechaVencimiento; }, set: function (obj, value) { obj.fechaVencimiento = value; } }, metadata: _metadata }, _fechaVencimiento_initializers, _fechaVencimiento_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateInventoryBatchDto = CreateInventoryBatchDto;
