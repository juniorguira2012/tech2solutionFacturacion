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
exports.AssignSerialsToTechnicianDto = void 0;
var class_validator_1 = require("class-validator");
var AssignSerialsToTechnicianDto = function () {
    var _a;
    var _technicianId_decorators;
    var _technicianId_initializers = [];
    var _technicianId_extraInitializers = [];
    var _serials_decorators;
    var _serials_initializers = [];
    var _serials_extraInitializers = [];
    var _usuarioId_decorators;
    var _usuarioId_initializers = [];
    var _usuarioId_extraInitializers = [];
    return _a = /** @class */ (function () {
            function AssignSerialsToTechnicianDto() {
                this.technicianId = __runInitializers(this, _technicianId_initializers, void 0);
                this.serials = (__runInitializers(this, _technicianId_extraInitializers), __runInitializers(this, _serials_initializers, void 0));
                this.usuarioId = (__runInitializers(this, _serials_extraInitializers), __runInitializers(this, _usuarioId_initializers, void 0));
                __runInitializers(this, _usuarioId_extraInitializers);
            }
            return AssignSerialsToTechnicianDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _technicianId_decorators = [(0, class_validator_1.IsInt)({ message: 'El ID del técnico debe ser un número.' }), (0, class_validator_1.IsNotEmpty)({ message: 'Debe proporcionar un técnico.' })];
            _serials_decorators = [(0, class_validator_1.IsArray)({ message: 'Los seriales deben ser un arreglo.' }), (0, class_validator_1.IsString)({ each: true, message: 'Cada serial debe ser un texto.' }), (0, class_validator_1.IsNotEmpty)({ each: true, message: 'No se permiten seriales vacíos.' })];
            _usuarioId_decorators = [(0, class_validator_1.IsInt)(), (0, class_validator_1.IsNotEmpty)()];
            __esDecorate(null, null, _technicianId_decorators, { kind: "field", name: "technicianId", static: false, private: false, access: { has: function (obj) { return "technicianId" in obj; }, get: function (obj) { return obj.technicianId; }, set: function (obj, value) { obj.technicianId = value; } }, metadata: _metadata }, _technicianId_initializers, _technicianId_extraInitializers);
            __esDecorate(null, null, _serials_decorators, { kind: "field", name: "serials", static: false, private: false, access: { has: function (obj) { return "serials" in obj; }, get: function (obj) { return obj.serials; }, set: function (obj, value) { obj.serials = value; } }, metadata: _metadata }, _serials_initializers, _serials_extraInitializers);
            __esDecorate(null, null, _usuarioId_decorators, { kind: "field", name: "usuarioId", static: false, private: false, access: { has: function (obj) { return "usuarioId" in obj; }, get: function (obj) { return obj.usuarioId; }, set: function (obj, value) { obj.usuarioId = value; } }, metadata: _metadata }, _usuarioId_initializers, _usuarioId_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.AssignSerialsToTechnicianDto = AssignSerialsToTechnicianDto;
