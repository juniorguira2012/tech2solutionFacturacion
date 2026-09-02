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
exports.CreateMovementDto = void 0;
var class_validator_1 = require("class-validator");
var CreateMovementDto = function () {
    var _a;
    var _productoId_decorators;
    var _productoId_initializers = [];
    var _productoId_extraInitializers = [];
    var _tipo_decorators;
    var _tipo_initializers = [];
    var _tipo_extraInitializers = [];
    var _cantidad_decorators;
    var _cantidad_initializers = [];
    var _cantidad_extraInitializers = [];
    var _nota_decorators;
    var _nota_initializers = [];
    var _nota_extraInitializers = [];
    var _usuarioId_decorators;
    var _usuarioId_initializers = [];
    var _usuarioId_extraInitializers = [];
    var _technicianId_decorators;
    var _technicianId_initializers = [];
    var _technicianId_extraInitializers = [];
    var _technicianName_decorators;
    var _technicianName_initializers = [];
    var _technicianName_extraInitializers = [];
    var _almacenOrigen_decorators;
    var _almacenOrigen_initializers = [];
    var _almacenOrigen_extraInitializers = [];
    var _almacenDestino_decorators;
    var _almacenDestino_initializers = [];
    var _almacenDestino_extraInitializers = [];
    var _costoUnitario_decorators;
    var _costoUnitario_initializers = [];
    var _costoUnitario_extraInitializers = [];
    var _referencia_decorators;
    var _referencia_initializers = [];
    var _referencia_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateMovementDto() {
                this.productoId = __runInitializers(this, _productoId_initializers, void 0);
                this.tipo = (__runInitializers(this, _productoId_extraInitializers), __runInitializers(this, _tipo_initializers, void 0));
                this.cantidad = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _cantidad_initializers, void 0));
                this.nota = (__runInitializers(this, _cantidad_extraInitializers), __runInitializers(this, _nota_initializers, void 0));
                this.usuarioId = (__runInitializers(this, _nota_extraInitializers), __runInitializers(this, _usuarioId_initializers, void 0));
                this.technicianId = (__runInitializers(this, _usuarioId_extraInitializers), __runInitializers(this, _technicianId_initializers, void 0));
                this.technicianName = (__runInitializers(this, _technicianId_extraInitializers), __runInitializers(this, _technicianName_initializers, void 0));
                this.almacenOrigen = (__runInitializers(this, _technicianName_extraInitializers), __runInitializers(this, _almacenOrigen_initializers, void 0));
                this.almacenDestino = (__runInitializers(this, _almacenOrigen_extraInitializers), __runInitializers(this, _almacenDestino_initializers, void 0));
                this.costoUnitario = (__runInitializers(this, _almacenDestino_extraInitializers), __runInitializers(this, _costoUnitario_initializers, void 0));
                this.referencia = (__runInitializers(this, _costoUnitario_extraInitializers), __runInitializers(this, _referencia_initializers, void 0));
                __runInitializers(this, _referencia_extraInitializers);
            }
            return CreateMovementDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productoId_decorators = [(0, class_validator_1.IsNumber)()];
            _tipo_decorators = [(0, class_validator_1.IsString)()];
            _cantidad_decorators = [(0, class_validator_1.IsNumber)()];
            _nota_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _usuarioId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _technicianId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _technicianName_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _almacenOrigen_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _almacenDestino_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _costoUnitario_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _referencia_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _productoId_decorators, { kind: "field", name: "productoId", static: false, private: false, access: { has: function (obj) { return "productoId" in obj; }, get: function (obj) { return obj.productoId; }, set: function (obj, value) { obj.productoId = value; } }, metadata: _metadata }, _productoId_initializers, _productoId_extraInitializers);
            __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: function (obj) { return "tipo" in obj; }, get: function (obj) { return obj.tipo; }, set: function (obj, value) { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
            __esDecorate(null, null, _cantidad_decorators, { kind: "field", name: "cantidad", static: false, private: false, access: { has: function (obj) { return "cantidad" in obj; }, get: function (obj) { return obj.cantidad; }, set: function (obj, value) { obj.cantidad = value; } }, metadata: _metadata }, _cantidad_initializers, _cantidad_extraInitializers);
            __esDecorate(null, null, _nota_decorators, { kind: "field", name: "nota", static: false, private: false, access: { has: function (obj) { return "nota" in obj; }, get: function (obj) { return obj.nota; }, set: function (obj, value) { obj.nota = value; } }, metadata: _metadata }, _nota_initializers, _nota_extraInitializers);
            __esDecorate(null, null, _usuarioId_decorators, { kind: "field", name: "usuarioId", static: false, private: false, access: { has: function (obj) { return "usuarioId" in obj; }, get: function (obj) { return obj.usuarioId; }, set: function (obj, value) { obj.usuarioId = value; } }, metadata: _metadata }, _usuarioId_initializers, _usuarioId_extraInitializers);
            __esDecorate(null, null, _technicianId_decorators, { kind: "field", name: "technicianId", static: false, private: false, access: { has: function (obj) { return "technicianId" in obj; }, get: function (obj) { return obj.technicianId; }, set: function (obj, value) { obj.technicianId = value; } }, metadata: _metadata }, _technicianId_initializers, _technicianId_extraInitializers);
            __esDecorate(null, null, _technicianName_decorators, { kind: "field", name: "technicianName", static: false, private: false, access: { has: function (obj) { return "technicianName" in obj; }, get: function (obj) { return obj.technicianName; }, set: function (obj, value) { obj.technicianName = value; } }, metadata: _metadata }, _technicianName_initializers, _technicianName_extraInitializers);
            __esDecorate(null, null, _almacenOrigen_decorators, { kind: "field", name: "almacenOrigen", static: false, private: false, access: { has: function (obj) { return "almacenOrigen" in obj; }, get: function (obj) { return obj.almacenOrigen; }, set: function (obj, value) { obj.almacenOrigen = value; } }, metadata: _metadata }, _almacenOrigen_initializers, _almacenOrigen_extraInitializers);
            __esDecorate(null, null, _almacenDestino_decorators, { kind: "field", name: "almacenDestino", static: false, private: false, access: { has: function (obj) { return "almacenDestino" in obj; }, get: function (obj) { return obj.almacenDestino; }, set: function (obj, value) { obj.almacenDestino = value; } }, metadata: _metadata }, _almacenDestino_initializers, _almacenDestino_extraInitializers);
            __esDecorate(null, null, _costoUnitario_decorators, { kind: "field", name: "costoUnitario", static: false, private: false, access: { has: function (obj) { return "costoUnitario" in obj; }, get: function (obj) { return obj.costoUnitario; }, set: function (obj, value) { obj.costoUnitario = value; } }, metadata: _metadata }, _costoUnitario_initializers, _costoUnitario_extraInitializers);
            __esDecorate(null, null, _referencia_decorators, { kind: "field", name: "referencia", static: false, private: false, access: { has: function (obj) { return "referencia" in obj; }, get: function (obj) { return obj.referencia; }, set: function (obj, value) { obj.referencia = value; } }, metadata: _metadata }, _referencia_initializers, _referencia_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateMovementDto = CreateMovementDto;
