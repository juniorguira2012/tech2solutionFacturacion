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
exports.AuditLog = void 0;
var typeorm_1 = require("typeorm");
var AuditLog = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('audit_logs')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _accion_decorators;
    var _accion_initializers = [];
    var _accion_extraInitializers = [];
    var _entidadId_decorators;
    var _entidadId_initializers = [];
    var _entidadId_extraInitializers = [];
    var _entidadTipo_decorators;
    var _entidadTipo_initializers = [];
    var _entidadTipo_extraInitializers = [];
    var _usuarioId_decorators;
    var _usuarioId_initializers = [];
    var _usuarioId_extraInitializers = [];
    var _detalles_decorators;
    var _detalles_initializers = [];
    var _detalles_extraInitializers = [];
    var _fecha_decorators;
    var _fecha_initializers = [];
    var _fecha_extraInitializers = [];
    var AuditLog = _classThis = /** @class */ (function () {
        function AuditLog_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.accion = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _accion_initializers, void 0));
            this.entidadId = (__runInitializers(this, _accion_extraInitializers), __runInitializers(this, _entidadId_initializers, void 0));
            this.entidadTipo = (__runInitializers(this, _entidadId_extraInitializers), __runInitializers(this, _entidadTipo_initializers, void 0));
            this.usuarioId = (__runInitializers(this, _entidadTipo_extraInitializers), __runInitializers(this, _usuarioId_initializers, void 0));
            this.detalles = (__runInitializers(this, _usuarioId_extraInitializers), __runInitializers(this, _detalles_initializers, void 0));
            this.fecha = (__runInitializers(this, _detalles_extraInitializers), __runInitializers(this, _fecha_initializers, void 0));
            __runInitializers(this, _fecha_extraInitializers);
        }
        return AuditLog_1;
    }());
    __setFunctionName(_classThis, "AuditLog");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _accion_decorators = [(0, typeorm_1.Column)()];
        _entidadId_decorators = [(0, typeorm_1.Column)()];
        _entidadTipo_decorators = [(0, typeorm_1.Column)()];
        _usuarioId_decorators = [(0, typeorm_1.Column)()];
        _detalles_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _fecha_decorators = [(0, typeorm_1.CreateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _accion_decorators, { kind: "field", name: "accion", static: false, private: false, access: { has: function (obj) { return "accion" in obj; }, get: function (obj) { return obj.accion; }, set: function (obj, value) { obj.accion = value; } }, metadata: _metadata }, _accion_initializers, _accion_extraInitializers);
        __esDecorate(null, null, _entidadId_decorators, { kind: "field", name: "entidadId", static: false, private: false, access: { has: function (obj) { return "entidadId" in obj; }, get: function (obj) { return obj.entidadId; }, set: function (obj, value) { obj.entidadId = value; } }, metadata: _metadata }, _entidadId_initializers, _entidadId_extraInitializers);
        __esDecorate(null, null, _entidadTipo_decorators, { kind: "field", name: "entidadTipo", static: false, private: false, access: { has: function (obj) { return "entidadTipo" in obj; }, get: function (obj) { return obj.entidadTipo; }, set: function (obj, value) { obj.entidadTipo = value; } }, metadata: _metadata }, _entidadTipo_initializers, _entidadTipo_extraInitializers);
        __esDecorate(null, null, _usuarioId_decorators, { kind: "field", name: "usuarioId", static: false, private: false, access: { has: function (obj) { return "usuarioId" in obj; }, get: function (obj) { return obj.usuarioId; }, set: function (obj, value) { obj.usuarioId = value; } }, metadata: _metadata }, _usuarioId_initializers, _usuarioId_extraInitializers);
        __esDecorate(null, null, _detalles_decorators, { kind: "field", name: "detalles", static: false, private: false, access: { has: function (obj) { return "detalles" in obj; }, get: function (obj) { return obj.detalles; }, set: function (obj, value) { obj.detalles = value; } }, metadata: _metadata }, _detalles_initializers, _detalles_extraInitializers);
        __esDecorate(null, null, _fecha_decorators, { kind: "field", name: "fecha", static: false, private: false, access: { has: function (obj) { return "fecha" in obj; }, get: function (obj) { return obj.fecha; }, set: function (obj, value) { obj.fecha = value; } }, metadata: _metadata }, _fecha_initializers, _fecha_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuditLog = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuditLog = _classThis;
}();
exports.AuditLog = AuditLog;
