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
exports.CreateComodatoDto = void 0;
var class_validator_1 = require("class-validator");
var CreateComodatoDto = function () {
    var _a;
    var _productoId_decorators;
    var _productoId_initializers = [];
    var _productoId_extraInitializers = [];
    var _responsable_decorators;
    var _responsable_initializers = [];
    var _responsable_extraInitializers = [];
    var _nota_decorators;
    var _nota_initializers = [];
    var _nota_extraInitializers = [];
    var _fechaEntrega_decorators;
    var _fechaEntrega_initializers = [];
    var _fechaEntrega_extraInitializers = [];
    var _fechaLimite_decorators;
    var _fechaLimite_initializers = [];
    var _fechaLimite_extraInitializers = [];
    var _usuarioId_decorators;
    var _usuarioId_initializers = [];
    var _usuarioId_extraInitializers = [];
    var _estado_decorators;
    var _estado_initializers = [];
    var _estado_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateComodatoDto() {
                this.productoId = __runInitializers(this, _productoId_initializers, void 0);
                this.responsable = (__runInitializers(this, _productoId_extraInitializers), __runInitializers(this, _responsable_initializers, void 0));
                this.nota = (__runInitializers(this, _responsable_extraInitializers), __runInitializers(this, _nota_initializers, void 0));
                this.fechaEntrega = (__runInitializers(this, _nota_extraInitializers), __runInitializers(this, _fechaEntrega_initializers, void 0));
                this.fechaLimite = (__runInitializers(this, _fechaEntrega_extraInitializers), __runInitializers(this, _fechaLimite_initializers, void 0));
                this.usuarioId = (__runInitializers(this, _fechaLimite_extraInitializers), __runInitializers(this, _usuarioId_initializers, void 0));
                this.estado = (__runInitializers(this, _usuarioId_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
                __runInitializers(this, _estado_extraInitializers);
            }
            return CreateComodatoDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productoId_decorators = [(0, class_validator_1.IsNumber)()];
            _responsable_decorators = [(0, class_validator_1.IsString)()];
            _nota_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _fechaEntrega_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _fechaLimite_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _usuarioId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _estado_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _productoId_decorators, { kind: "field", name: "productoId", static: false, private: false, access: { has: function (obj) { return "productoId" in obj; }, get: function (obj) { return obj.productoId; }, set: function (obj, value) { obj.productoId = value; } }, metadata: _metadata }, _productoId_initializers, _productoId_extraInitializers);
            __esDecorate(null, null, _responsable_decorators, { kind: "field", name: "responsable", static: false, private: false, access: { has: function (obj) { return "responsable" in obj; }, get: function (obj) { return obj.responsable; }, set: function (obj, value) { obj.responsable = value; } }, metadata: _metadata }, _responsable_initializers, _responsable_extraInitializers);
            __esDecorate(null, null, _nota_decorators, { kind: "field", name: "nota", static: false, private: false, access: { has: function (obj) { return "nota" in obj; }, get: function (obj) { return obj.nota; }, set: function (obj, value) { obj.nota = value; } }, metadata: _metadata }, _nota_initializers, _nota_extraInitializers);
            __esDecorate(null, null, _fechaEntrega_decorators, { kind: "field", name: "fechaEntrega", static: false, private: false, access: { has: function (obj) { return "fechaEntrega" in obj; }, get: function (obj) { return obj.fechaEntrega; }, set: function (obj, value) { obj.fechaEntrega = value; } }, metadata: _metadata }, _fechaEntrega_initializers, _fechaEntrega_extraInitializers);
            __esDecorate(null, null, _fechaLimite_decorators, { kind: "field", name: "fechaLimite", static: false, private: false, access: { has: function (obj) { return "fechaLimite" in obj; }, get: function (obj) { return obj.fechaLimite; }, set: function (obj, value) { obj.fechaLimite = value; } }, metadata: _metadata }, _fechaLimite_initializers, _fechaLimite_extraInitializers);
            __esDecorate(null, null, _usuarioId_decorators, { kind: "field", name: "usuarioId", static: false, private: false, access: { has: function (obj) { return "usuarioId" in obj; }, get: function (obj) { return obj.usuarioId; }, set: function (obj, value) { obj.usuarioId = value; } }, metadata: _metadata }, _usuarioId_initializers, _usuarioId_extraInitializers);
            __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: function (obj) { return "estado" in obj; }, get: function (obj) { return obj.estado; }, set: function (obj, value) { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateComodatoDto = CreateComodatoDto;
