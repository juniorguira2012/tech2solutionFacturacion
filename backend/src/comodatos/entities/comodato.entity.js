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
exports.Comodato = void 0;
var typeorm_1 = require("typeorm");
var product_entity_1 = require("../../products/entities/product.entity");
var user_entity_1 = require("../../user/dto/entities/user.entity");
var Comodato = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('comodatos')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _productoId_decorators;
    var _productoId_initializers = [];
    var _productoId_extraInitializers = [];
    var _producto_decorators;
    var _producto_initializers = [];
    var _producto_extraInitializers = [];
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
    var _fechaDevolucion_decorators;
    var _fechaDevolucion_initializers = [];
    var _fechaDevolucion_extraInitializers = [];
    var _usuarioId_decorators;
    var _usuarioId_initializers = [];
    var _usuarioId_extraInitializers = [];
    var _usuario_decorators;
    var _usuario_initializers = [];
    var _usuario_extraInitializers = [];
    var _estado_decorators;
    var _estado_initializers = [];
    var _estado_extraInitializers = [];
    var _fechaCreacion_decorators;
    var _fechaCreacion_initializers = [];
    var _fechaCreacion_extraInitializers = [];
    var _fechaActualizacion_decorators;
    var _fechaActualizacion_initializers = [];
    var _fechaActualizacion_extraInitializers = [];
    var Comodato = _classThis = /** @class */ (function () {
        function Comodato_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.productoId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _productoId_initializers, void 0));
            this.producto = (__runInitializers(this, _productoId_extraInitializers), __runInitializers(this, _producto_initializers, void 0));
            this.responsable = (__runInitializers(this, _producto_extraInitializers), __runInitializers(this, _responsable_initializers, void 0));
            this.nota = (__runInitializers(this, _responsable_extraInitializers), __runInitializers(this, _nota_initializers, void 0));
            this.fechaEntrega = (__runInitializers(this, _nota_extraInitializers), __runInitializers(this, _fechaEntrega_initializers, void 0));
            this.fechaLimite = (__runInitializers(this, _fechaEntrega_extraInitializers), __runInitializers(this, _fechaLimite_initializers, void 0));
            this.fechaDevolucion = (__runInitializers(this, _fechaLimite_extraInitializers), __runInitializers(this, _fechaDevolucion_initializers, void 0));
            this.usuarioId = (__runInitializers(this, _fechaDevolucion_extraInitializers), __runInitializers(this, _usuarioId_initializers, void 0));
            this.usuario = (__runInitializers(this, _usuarioId_extraInitializers), __runInitializers(this, _usuario_initializers, void 0));
            this.estado = (__runInitializers(this, _usuario_extraInitializers), __runInitializers(this, _estado_initializers, void 0)); // 'activo', 'devuelto', 'perdido'
            this.fechaCreacion = (__runInitializers(this, _estado_extraInitializers), __runInitializers(this, _fechaCreacion_initializers, void 0));
            this.fechaActualizacion = (__runInitializers(this, _fechaCreacion_extraInitializers), __runInitializers(this, _fechaActualizacion_initializers, void 0));
            __runInitializers(this, _fechaActualizacion_extraInitializers);
        }
        return Comodato_1;
    }());
    __setFunctionName(_classThis, "Comodato");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _productoId_decorators = [(0, typeorm_1.Column)()];
        _producto_decorators = [(0, typeorm_1.ManyToOne)(function () { return product_entity_1.Product; }, { eager: true }), (0, typeorm_1.JoinColumn)({ name: 'productoId' })];
        _responsable_decorators = [(0, typeorm_1.Column)()];
        _nota_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _fechaEntrega_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _fechaLimite_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _fechaDevolucion_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _usuarioId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _usuario_decorators = [(0, typeorm_1.ManyToOne)(function () { return user_entity_1.User; }, { nullable: true, eager: true }), (0, typeorm_1.JoinColumn)({ name: 'usuarioId' })];
        _estado_decorators = [(0, typeorm_1.Column)({ default: 'activo' })];
        _fechaCreacion_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _fechaActualizacion_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _productoId_decorators, { kind: "field", name: "productoId", static: false, private: false, access: { has: function (obj) { return "productoId" in obj; }, get: function (obj) { return obj.productoId; }, set: function (obj, value) { obj.productoId = value; } }, metadata: _metadata }, _productoId_initializers, _productoId_extraInitializers);
        __esDecorate(null, null, _producto_decorators, { kind: "field", name: "producto", static: false, private: false, access: { has: function (obj) { return "producto" in obj; }, get: function (obj) { return obj.producto; }, set: function (obj, value) { obj.producto = value; } }, metadata: _metadata }, _producto_initializers, _producto_extraInitializers);
        __esDecorate(null, null, _responsable_decorators, { kind: "field", name: "responsable", static: false, private: false, access: { has: function (obj) { return "responsable" in obj; }, get: function (obj) { return obj.responsable; }, set: function (obj, value) { obj.responsable = value; } }, metadata: _metadata }, _responsable_initializers, _responsable_extraInitializers);
        __esDecorate(null, null, _nota_decorators, { kind: "field", name: "nota", static: false, private: false, access: { has: function (obj) { return "nota" in obj; }, get: function (obj) { return obj.nota; }, set: function (obj, value) { obj.nota = value; } }, metadata: _metadata }, _nota_initializers, _nota_extraInitializers);
        __esDecorate(null, null, _fechaEntrega_decorators, { kind: "field", name: "fechaEntrega", static: false, private: false, access: { has: function (obj) { return "fechaEntrega" in obj; }, get: function (obj) { return obj.fechaEntrega; }, set: function (obj, value) { obj.fechaEntrega = value; } }, metadata: _metadata }, _fechaEntrega_initializers, _fechaEntrega_extraInitializers);
        __esDecorate(null, null, _fechaLimite_decorators, { kind: "field", name: "fechaLimite", static: false, private: false, access: { has: function (obj) { return "fechaLimite" in obj; }, get: function (obj) { return obj.fechaLimite; }, set: function (obj, value) { obj.fechaLimite = value; } }, metadata: _metadata }, _fechaLimite_initializers, _fechaLimite_extraInitializers);
        __esDecorate(null, null, _fechaDevolucion_decorators, { kind: "field", name: "fechaDevolucion", static: false, private: false, access: { has: function (obj) { return "fechaDevolucion" in obj; }, get: function (obj) { return obj.fechaDevolucion; }, set: function (obj, value) { obj.fechaDevolucion = value; } }, metadata: _metadata }, _fechaDevolucion_initializers, _fechaDevolucion_extraInitializers);
        __esDecorate(null, null, _usuarioId_decorators, { kind: "field", name: "usuarioId", static: false, private: false, access: { has: function (obj) { return "usuarioId" in obj; }, get: function (obj) { return obj.usuarioId; }, set: function (obj, value) { obj.usuarioId = value; } }, metadata: _metadata }, _usuarioId_initializers, _usuarioId_extraInitializers);
        __esDecorate(null, null, _usuario_decorators, { kind: "field", name: "usuario", static: false, private: false, access: { has: function (obj) { return "usuario" in obj; }, get: function (obj) { return obj.usuario; }, set: function (obj, value) { obj.usuario = value; } }, metadata: _metadata }, _usuario_initializers, _usuario_extraInitializers);
        __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: function (obj) { return "estado" in obj; }, get: function (obj) { return obj.estado; }, set: function (obj, value) { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
        __esDecorate(null, null, _fechaCreacion_decorators, { kind: "field", name: "fechaCreacion", static: false, private: false, access: { has: function (obj) { return "fechaCreacion" in obj; }, get: function (obj) { return obj.fechaCreacion; }, set: function (obj, value) { obj.fechaCreacion = value; } }, metadata: _metadata }, _fechaCreacion_initializers, _fechaCreacion_extraInitializers);
        __esDecorate(null, null, _fechaActualizacion_decorators, { kind: "field", name: "fechaActualizacion", static: false, private: false, access: { has: function (obj) { return "fechaActualizacion" in obj; }, get: function (obj) { return obj.fechaActualizacion; }, set: function (obj, value) { obj.fechaActualizacion = value; } }, metadata: _metadata }, _fechaActualizacion_initializers, _fechaActualizacion_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Comodato = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Comodato = _classThis;
}();
exports.Comodato = Comodato;
