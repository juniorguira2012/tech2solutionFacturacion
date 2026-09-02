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
exports.CreateProductDto = void 0;
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var CreateProductDto = function () {
    var _a;
    var _nombre_decorators;
    var _nombre_initializers = [];
    var _nombre_extraInitializers = [];
    var _codigo_decorators;
    var _codigo_initializers = [];
    var _codigo_extraInitializers = [];
    var _modelo_decorators;
    var _modelo_initializers = [];
    var _modelo_extraInitializers = [];
    var _serie_decorators;
    var _serie_initializers = [];
    var _serie_extraInitializers = [];
    var _categoria_decorators;
    var _categoria_initializers = [];
    var _categoria_extraInitializers = [];
    var _precio_decorators;
    var _precio_initializers = [];
    var _precio_extraInitializers = [];
    var _stock_decorators;
    var _stock_initializers = [];
    var _stock_extraInitializers = [];
    var _stockMinimo_decorators;
    var _stockMinimo_initializers = [];
    var _stockMinimo_extraInitializers = [];
    var _isSerialized_decorators;
    var _isSerialized_initializers = [];
    var _isSerialized_extraInitializers = [];
    var _imagen_decorators;
    var _imagen_initializers = [];
    var _imagen_extraInitializers = [];
    var _almacen_decorators;
    var _almacen_initializers = [];
    var _almacen_extraInitializers = [];
    var _pasillo_decorators;
    var _pasillo_initializers = [];
    var _pasillo_extraInitializers = [];
    var _fila_decorators;
    var _fila_initializers = [];
    var _fila_extraInitializers = [];
    var _ubicacion_decorators;
    var _ubicacion_initializers = [];
    var _ubicacion_extraInitializers = [];
    var _unidadMedida_decorators;
    var _unidadMedida_initializers = [];
    var _unidadMedida_extraInitializers = [];
    var _movimientoInventario_decorators;
    var _movimientoInventario_initializers = [];
    var _movimientoInventario_extraInitializers = [];
    var _descripcion_decorators;
    var _descripcion_initializers = [];
    var _descripcion_extraInitializers = [];
    var _camposPersonalizados_decorators;
    var _camposPersonalizados_initializers = [];
    var _camposPersonalizados_extraInitializers = [];
    var _vendidos_decorators;
    var _vendidos_initializers = [];
    var _vendidos_extraInitializers = [];
    var _isActive_decorators;
    var _isActive_initializers = [];
    var _isActive_extraInitializers = [];
    var _proveedorId_decorators;
    var _proveedorId_initializers = [];
    var _proveedorId_extraInitializers = [];
    var _correo_decorators;
    var _correo_initializers = [];
    var _correo_extraInitializers = [];
    var _nota_decorators;
    var _nota_initializers = [];
    var _nota_extraInitializers = [];
    var _serials_decorators;
    var _serials_initializers = [];
    var _serials_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateProductDto() {
                this.nombre = __runInitializers(this, _nombre_initializers, void 0);
                this.codigo = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _codigo_initializers, void 0));
                this.modelo = (__runInitializers(this, _codigo_extraInitializers), __runInitializers(this, _modelo_initializers, void 0));
                this.serie = (__runInitializers(this, _modelo_extraInitializers), __runInitializers(this, _serie_initializers, void 0));
                this.categoria = (__runInitializers(this, _serie_extraInitializers), __runInitializers(this, _categoria_initializers, void 0));
                this.precio = (__runInitializers(this, _categoria_extraInitializers), __runInitializers(this, _precio_initializers, void 0));
                this.stock = (__runInitializers(this, _precio_extraInitializers), __runInitializers(this, _stock_initializers, void 0));
                this.stockMinimo = (__runInitializers(this, _stock_extraInitializers), __runInitializers(this, _stockMinimo_initializers, void 0));
                // 👇 AGREGA ESTE CAMPO AQUÍ PARA QUE EL BACKEND LO ACEPTE
                this.isSerialized = (__runInitializers(this, _stockMinimo_extraInitializers), __runInitializers(this, _isSerialized_initializers, void 0));
                this.imagen = (__runInitializers(this, _isSerialized_extraInitializers), __runInitializers(this, _imagen_initializers, void 0));
                this.almacen = (__runInitializers(this, _imagen_extraInitializers), __runInitializers(this, _almacen_initializers, void 0));
                this.pasillo = (__runInitializers(this, _almacen_extraInitializers), __runInitializers(this, _pasillo_initializers, void 0));
                this.fila = (__runInitializers(this, _pasillo_extraInitializers), __runInitializers(this, _fila_initializers, void 0));
                this.ubicacion = (__runInitializers(this, _fila_extraInitializers), __runInitializers(this, _ubicacion_initializers, void 0));
                this.unidadMedida = (__runInitializers(this, _ubicacion_extraInitializers), __runInitializers(this, _unidadMedida_initializers, void 0));
                this.movimientoInventario = (__runInitializers(this, _unidadMedida_extraInitializers), __runInitializers(this, _movimientoInventario_initializers, void 0));
                this.descripcion = (__runInitializers(this, _movimientoInventario_extraInitializers), __runInitializers(this, _descripcion_initializers, void 0));
                this.camposPersonalizados = (__runInitializers(this, _descripcion_extraInitializers), __runInitializers(this, _camposPersonalizados_initializers, void 0));
                this.vendidos = (__runInitializers(this, _camposPersonalizados_extraInitializers), __runInitializers(this, _vendidos_initializers, void 0));
                this.isActive = (__runInitializers(this, _vendidos_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
                this.proveedorId = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _proveedorId_initializers, void 0));
                this.correo = (__runInitializers(this, _proveedorId_extraInitializers), __runInitializers(this, _correo_initializers, void 0));
                this.nota = (__runInitializers(this, _correo_extraInitializers), __runInitializers(this, _nota_initializers, void 0));
                this.serials = (__runInitializers(this, _nota_extraInitializers), __runInitializers(this, _serials_initializers, void 0));
                __runInitializers(this, _serials_extraInitializers);
            }
            return CreateProductDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nombre_decorators = [(0, class_validator_1.IsString)()];
            _codigo_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _modelo_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _serie_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _categoria_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _precio_decorators = [(0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }), (0, class_validator_1.Min)(0)];
            _stock_decorators = [(0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0)];
            _stockMinimo_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0)];
            _isSerialized_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(function () { return Boolean; }), (0, class_validator_1.IsBoolean)()];
            _imagen_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _almacen_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _pasillo_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _fila_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _ubicacion_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _unidadMedida_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _movimientoInventario_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _descripcion_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _camposPersonalizados_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _vendidos_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0)];
            _isActive_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _proveedorId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsPositive)()];
            _correo_decorators = [(0, class_validator_1.IsEmail)(), (0, class_validator_1.IsOptional)()];
            _nota_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _serials_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: function (obj) { return "nombre" in obj; }, get: function (obj) { return obj.nombre; }, set: function (obj, value) { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
            __esDecorate(null, null, _codigo_decorators, { kind: "field", name: "codigo", static: false, private: false, access: { has: function (obj) { return "codigo" in obj; }, get: function (obj) { return obj.codigo; }, set: function (obj, value) { obj.codigo = value; } }, metadata: _metadata }, _codigo_initializers, _codigo_extraInitializers);
            __esDecorate(null, null, _modelo_decorators, { kind: "field", name: "modelo", static: false, private: false, access: { has: function (obj) { return "modelo" in obj; }, get: function (obj) { return obj.modelo; }, set: function (obj, value) { obj.modelo = value; } }, metadata: _metadata }, _modelo_initializers, _modelo_extraInitializers);
            __esDecorate(null, null, _serie_decorators, { kind: "field", name: "serie", static: false, private: false, access: { has: function (obj) { return "serie" in obj; }, get: function (obj) { return obj.serie; }, set: function (obj, value) { obj.serie = value; } }, metadata: _metadata }, _serie_initializers, _serie_extraInitializers);
            __esDecorate(null, null, _categoria_decorators, { kind: "field", name: "categoria", static: false, private: false, access: { has: function (obj) { return "categoria" in obj; }, get: function (obj) { return obj.categoria; }, set: function (obj, value) { obj.categoria = value; } }, metadata: _metadata }, _categoria_initializers, _categoria_extraInitializers);
            __esDecorate(null, null, _precio_decorators, { kind: "field", name: "precio", static: false, private: false, access: { has: function (obj) { return "precio" in obj; }, get: function (obj) { return obj.precio; }, set: function (obj, value) { obj.precio = value; } }, metadata: _metadata }, _precio_initializers, _precio_extraInitializers);
            __esDecorate(null, null, _stock_decorators, { kind: "field", name: "stock", static: false, private: false, access: { has: function (obj) { return "stock" in obj; }, get: function (obj) { return obj.stock; }, set: function (obj, value) { obj.stock = value; } }, metadata: _metadata }, _stock_initializers, _stock_extraInitializers);
            __esDecorate(null, null, _stockMinimo_decorators, { kind: "field", name: "stockMinimo", static: false, private: false, access: { has: function (obj) { return "stockMinimo" in obj; }, get: function (obj) { return obj.stockMinimo; }, set: function (obj, value) { obj.stockMinimo = value; } }, metadata: _metadata }, _stockMinimo_initializers, _stockMinimo_extraInitializers);
            __esDecorate(null, null, _isSerialized_decorators, { kind: "field", name: "isSerialized", static: false, private: false, access: { has: function (obj) { return "isSerialized" in obj; }, get: function (obj) { return obj.isSerialized; }, set: function (obj, value) { obj.isSerialized = value; } }, metadata: _metadata }, _isSerialized_initializers, _isSerialized_extraInitializers);
            __esDecorate(null, null, _imagen_decorators, { kind: "field", name: "imagen", static: false, private: false, access: { has: function (obj) { return "imagen" in obj; }, get: function (obj) { return obj.imagen; }, set: function (obj, value) { obj.imagen = value; } }, metadata: _metadata }, _imagen_initializers, _imagen_extraInitializers);
            __esDecorate(null, null, _almacen_decorators, { kind: "field", name: "almacen", static: false, private: false, access: { has: function (obj) { return "almacen" in obj; }, get: function (obj) { return obj.almacen; }, set: function (obj, value) { obj.almacen = value; } }, metadata: _metadata }, _almacen_initializers, _almacen_extraInitializers);
            __esDecorate(null, null, _pasillo_decorators, { kind: "field", name: "pasillo", static: false, private: false, access: { has: function (obj) { return "pasillo" in obj; }, get: function (obj) { return obj.pasillo; }, set: function (obj, value) { obj.pasillo = value; } }, metadata: _metadata }, _pasillo_initializers, _pasillo_extraInitializers);
            __esDecorate(null, null, _fila_decorators, { kind: "field", name: "fila", static: false, private: false, access: { has: function (obj) { return "fila" in obj; }, get: function (obj) { return obj.fila; }, set: function (obj, value) { obj.fila = value; } }, metadata: _metadata }, _fila_initializers, _fila_extraInitializers);
            __esDecorate(null, null, _ubicacion_decorators, { kind: "field", name: "ubicacion", static: false, private: false, access: { has: function (obj) { return "ubicacion" in obj; }, get: function (obj) { return obj.ubicacion; }, set: function (obj, value) { obj.ubicacion = value; } }, metadata: _metadata }, _ubicacion_initializers, _ubicacion_extraInitializers);
            __esDecorate(null, null, _unidadMedida_decorators, { kind: "field", name: "unidadMedida", static: false, private: false, access: { has: function (obj) { return "unidadMedida" in obj; }, get: function (obj) { return obj.unidadMedida; }, set: function (obj, value) { obj.unidadMedida = value; } }, metadata: _metadata }, _unidadMedida_initializers, _unidadMedida_extraInitializers);
            __esDecorate(null, null, _movimientoInventario_decorators, { kind: "field", name: "movimientoInventario", static: false, private: false, access: { has: function (obj) { return "movimientoInventario" in obj; }, get: function (obj) { return obj.movimientoInventario; }, set: function (obj, value) { obj.movimientoInventario = value; } }, metadata: _metadata }, _movimientoInventario_initializers, _movimientoInventario_extraInitializers);
            __esDecorate(null, null, _descripcion_decorators, { kind: "field", name: "descripcion", static: false, private: false, access: { has: function (obj) { return "descripcion" in obj; }, get: function (obj) { return obj.descripcion; }, set: function (obj, value) { obj.descripcion = value; } }, metadata: _metadata }, _descripcion_initializers, _descripcion_extraInitializers);
            __esDecorate(null, null, _camposPersonalizados_decorators, { kind: "field", name: "camposPersonalizados", static: false, private: false, access: { has: function (obj) { return "camposPersonalizados" in obj; }, get: function (obj) { return obj.camposPersonalizados; }, set: function (obj, value) { obj.camposPersonalizados = value; } }, metadata: _metadata }, _camposPersonalizados_initializers, _camposPersonalizados_extraInitializers);
            __esDecorate(null, null, _vendidos_decorators, { kind: "field", name: "vendidos", static: false, private: false, access: { has: function (obj) { return "vendidos" in obj; }, get: function (obj) { return obj.vendidos; }, set: function (obj, value) { obj.vendidos = value; } }, metadata: _metadata }, _vendidos_initializers, _vendidos_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: function (obj) { return "isActive" in obj; }, get: function (obj) { return obj.isActive; }, set: function (obj, value) { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _proveedorId_decorators, { kind: "field", name: "proveedorId", static: false, private: false, access: { has: function (obj) { return "proveedorId" in obj; }, get: function (obj) { return obj.proveedorId; }, set: function (obj, value) { obj.proveedorId = value; } }, metadata: _metadata }, _proveedorId_initializers, _proveedorId_extraInitializers);
            __esDecorate(null, null, _correo_decorators, { kind: "field", name: "correo", static: false, private: false, access: { has: function (obj) { return "correo" in obj; }, get: function (obj) { return obj.correo; }, set: function (obj, value) { obj.correo = value; } }, metadata: _metadata }, _correo_initializers, _correo_extraInitializers);
            __esDecorate(null, null, _nota_decorators, { kind: "field", name: "nota", static: false, private: false, access: { has: function (obj) { return "nota" in obj; }, get: function (obj) { return obj.nota; }, set: function (obj, value) { obj.nota = value; } }, metadata: _metadata }, _nota_initializers, _nota_extraInitializers);
            __esDecorate(null, null, _serials_decorators, { kind: "field", name: "serials", static: false, private: false, access: { has: function (obj) { return "serials" in obj; }, get: function (obj) { return obj.serials; }, set: function (obj, value) { obj.serials = value; } }, metadata: _metadata }, _serials_initializers, _serials_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateProductDto = CreateProductDto;
