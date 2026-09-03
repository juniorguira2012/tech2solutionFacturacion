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
exports.Movement = void 0;
var typeorm_1 = require("typeorm");
var product_entity_1 = require("../../products/entities/product.entity");
var technician_entity_1 = require("./technician.entity");
var user_entity_1 = require("../../user/dto/entities/user.entity");
var Movement = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('movements')];
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
    var _tipo_decorators;
    var _tipo_initializers = [];
    var _tipo_extraInitializers = [];
    var _cantidad_decorators;
    var _cantidad_initializers = [];
    var _cantidad_extraInitializers = [];
    var _serials_decorators;
    var _serials_initializers = [];
    var _serials_extraInitializers = [];
    var _nota_decorators;
    var _nota_initializers = [];
    var _nota_extraInitializers = [];
    var _nuevoStock_decorators;
    var _nuevoStock_initializers = [];
    var _nuevoStock_extraInitializers = [];
    var _costoUnitario_decorators;
    var _costoUnitario_initializers = [];
    var _costoUnitario_extraInitializers = [];
    var _referencia_decorators;
    var _referencia_initializers = [];
    var _referencia_extraInitializers = [];
    var _usuarioId_decorators;
    var _usuarioId_initializers = [];
    var _usuarioId_extraInitializers = [];
    var _usuario_decorators;
    var _usuario_initializers = [];
    var _usuario_extraInitializers = [];
    var _technicianId_decorators;
    var _technicianId_initializers = [];
    var _technicianId_extraInitializers = [];
    var _technician_decorators;
    var _technician_initializers = [];
    var _technician_extraInitializers = [];
    var _almacenOrigen_decorators;
    var _almacenOrigen_initializers = [];
    var _almacenOrigen_extraInitializers = [];
    var _almacenDestino_decorators;
    var _almacenDestino_initializers = [];
    var _almacenDestino_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var Movement = _classThis = /** @class */ (function () {
        function Movement_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.productoId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _productoId_initializers, void 0));
            this.producto = (__runInitializers(this, _productoId_extraInitializers), __runInitializers(this, _producto_initializers, void 0));
            this.tipo = (__runInitializers(this, _producto_extraInitializers), __runInitializers(this, _tipo_initializers, void 0)); // ENTRADA, SALIDA, DESPACHAR, AJUSTE
            this.cantidad = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _cantidad_initializers, void 0));
            this.serials = (__runInitializers(this, _cantidad_extraInitializers), __runInitializers(this, _serials_initializers, void 0));
            this.nota = (__runInitializers(this, _serials_extraInitializers), __runInitializers(this, _nota_initializers, void 0));
            this.nuevoStock = (__runInitializers(this, _nota_extraInitializers), __runInitializers(this, _nuevoStock_initializers, void 0));
            this.costoUnitario = (__runInitializers(this, _nuevoStock_extraInitializers), __runInitializers(this, _costoUnitario_initializers, void 0));
            this.referencia = (__runInitializers(this, _costoUnitario_extraInitializers), __runInitializers(this, _referencia_initializers, void 0));
            this.usuarioId = (__runInitializers(this, _referencia_extraInitializers), __runInitializers(this, _usuarioId_initializers, void 0));
            this.usuario = (__runInitializers(this, _usuarioId_extraInitializers), __runInitializers(this, _usuario_initializers, void 0));
            this.technicianId = (__runInitializers(this, _usuario_extraInitializers), __runInitializers(this, _technicianId_initializers, void 0));
            this.technician = (__runInitializers(this, _technicianId_extraInitializers), __runInitializers(this, _technician_initializers, void 0));
            this.almacenOrigen = (__runInitializers(this, _technician_extraInitializers), __runInitializers(this, _almacenOrigen_initializers, void 0));
            this.almacenDestino = (__runInitializers(this, _almacenOrigen_extraInitializers), __runInitializers(this, _almacenDestino_initializers, void 0));
            this.createdAt = (__runInitializers(this, _almacenDestino_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            __runInitializers(this, _createdAt_extraInitializers);
        }
        return Movement_1;
    }());
    __setFunctionName(_classThis, "Movement");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _productoId_decorators = [(0, typeorm_1.Column)()];
        _producto_decorators = [(0, typeorm_1.ManyToOne)(function () { return product_entity_1.Product; }), (0, typeorm_1.JoinColumn)({ name: 'productoId' })];
        _tipo_decorators = [(0, typeorm_1.Column)()];
        _cantidad_decorators = [(0, typeorm_1.Column)()];
        _serials_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true, default: function () { return "'[]'"; } })];
        _nota_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _nuevoStock_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _costoUnitario_decorators = [(0, typeorm_1.Column)({ nullable: true, type: 'decimal', precision: 10, scale: 2 })];
        _referencia_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _usuarioId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _usuario_decorators = [(0, typeorm_1.ManyToOne)(function () { return user_entity_1.User; }, { nullable: true }), (0, typeorm_1.JoinColumn)({ name: 'usuarioId' })];
        _technicianId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _technician_decorators = [(0, typeorm_1.ManyToOne)(function () { return technician_entity_1.Technician; }, { nullable: true }), (0, typeorm_1.JoinColumn)({ name: 'technicianId' })];
        _almacenOrigen_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _almacenDestino_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _productoId_decorators, { kind: "field", name: "productoId", static: false, private: false, access: { has: function (obj) { return "productoId" in obj; }, get: function (obj) { return obj.productoId; }, set: function (obj, value) { obj.productoId = value; } }, metadata: _metadata }, _productoId_initializers, _productoId_extraInitializers);
        __esDecorate(null, null, _producto_decorators, { kind: "field", name: "producto", static: false, private: false, access: { has: function (obj) { return "producto" in obj; }, get: function (obj) { return obj.producto; }, set: function (obj, value) { obj.producto = value; } }, metadata: _metadata }, _producto_initializers, _producto_extraInitializers);
        __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: function (obj) { return "tipo" in obj; }, get: function (obj) { return obj.tipo; }, set: function (obj, value) { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
        __esDecorate(null, null, _cantidad_decorators, { kind: "field", name: "cantidad", static: false, private: false, access: { has: function (obj) { return "cantidad" in obj; }, get: function (obj) { return obj.cantidad; }, set: function (obj, value) { obj.cantidad = value; } }, metadata: _metadata }, _cantidad_initializers, _cantidad_extraInitializers);
        __esDecorate(null, null, _serials_decorators, { kind: "field", name: "serials", static: false, private: false, access: { has: function (obj) { return "serials" in obj; }, get: function (obj) { return obj.serials; }, set: function (obj, value) { obj.serials = value; } }, metadata: _metadata }, _serials_initializers, _serials_extraInitializers);
        __esDecorate(null, null, _nota_decorators, { kind: "field", name: "nota", static: false, private: false, access: { has: function (obj) { return "nota" in obj; }, get: function (obj) { return obj.nota; }, set: function (obj, value) { obj.nota = value; } }, metadata: _metadata }, _nota_initializers, _nota_extraInitializers);
        __esDecorate(null, null, _nuevoStock_decorators, { kind: "field", name: "nuevoStock", static: false, private: false, access: { has: function (obj) { return "nuevoStock" in obj; }, get: function (obj) { return obj.nuevoStock; }, set: function (obj, value) { obj.nuevoStock = value; } }, metadata: _metadata }, _nuevoStock_initializers, _nuevoStock_extraInitializers);
        __esDecorate(null, null, _costoUnitario_decorators, { kind: "field", name: "costoUnitario", static: false, private: false, access: { has: function (obj) { return "costoUnitario" in obj; }, get: function (obj) { return obj.costoUnitario; }, set: function (obj, value) { obj.costoUnitario = value; } }, metadata: _metadata }, _costoUnitario_initializers, _costoUnitario_extraInitializers);
        __esDecorate(null, null, _referencia_decorators, { kind: "field", name: "referencia", static: false, private: false, access: { has: function (obj) { return "referencia" in obj; }, get: function (obj) { return obj.referencia; }, set: function (obj, value) { obj.referencia = value; } }, metadata: _metadata }, _referencia_initializers, _referencia_extraInitializers);
        __esDecorate(null, null, _usuarioId_decorators, { kind: "field", name: "usuarioId", static: false, private: false, access: { has: function (obj) { return "usuarioId" in obj; }, get: function (obj) { return obj.usuarioId; }, set: function (obj, value) { obj.usuarioId = value; } }, metadata: _metadata }, _usuarioId_initializers, _usuarioId_extraInitializers);
        __esDecorate(null, null, _usuario_decorators, { kind: "field", name: "usuario", static: false, private: false, access: { has: function (obj) { return "usuario" in obj; }, get: function (obj) { return obj.usuario; }, set: function (obj, value) { obj.usuario = value; } }, metadata: _metadata }, _usuario_initializers, _usuario_extraInitializers);
        __esDecorate(null, null, _technicianId_decorators, { kind: "field", name: "technicianId", static: false, private: false, access: { has: function (obj) { return "technicianId" in obj; }, get: function (obj) { return obj.technicianId; }, set: function (obj, value) { obj.technicianId = value; } }, metadata: _metadata }, _technicianId_initializers, _technicianId_extraInitializers);
        __esDecorate(null, null, _technician_decorators, { kind: "field", name: "technician", static: false, private: false, access: { has: function (obj) { return "technician" in obj; }, get: function (obj) { return obj.technician; }, set: function (obj, value) { obj.technician = value; } }, metadata: _metadata }, _technician_initializers, _technician_extraInitializers);
        __esDecorate(null, null, _almacenOrigen_decorators, { kind: "field", name: "almacenOrigen", static: false, private: false, access: { has: function (obj) { return "almacenOrigen" in obj; }, get: function (obj) { return obj.almacenOrigen; }, set: function (obj, value) { obj.almacenOrigen = value; } }, metadata: _metadata }, _almacenOrigen_initializers, _almacenOrigen_extraInitializers);
        __esDecorate(null, null, _almacenDestino_decorators, { kind: "field", name: "almacenDestino", static: false, private: false, access: { has: function (obj) { return "almacenDestino" in obj; }, get: function (obj) { return obj.almacenDestino; }, set: function (obj, value) { obj.almacenDestino = value; } }, metadata: _metadata }, _almacenDestino_initializers, _almacenDestino_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Movement = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Movement = _classThis;
}();
exports.Movement = Movement;
