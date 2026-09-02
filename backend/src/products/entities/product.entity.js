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
exports.Product = void 0;
var typeorm_1 = require("typeorm");
var count_item_entity_1 = require("../../inventory-counts/entities/count-item.entity");
var product_warehouse_stock_entity_1 = require("./product-warehouse-stock.entity");
var provider_entity_1 = require("../../providers/entities/provider.entity");
var product_serial_entity_1 = require("./product-serial.entity");
var Product = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('products')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
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
    var _nota_decorators;
    var _nota_initializers = [];
    var _nota_extraInitializers = [];
    var _camposPersonalizados_decorators;
    var _camposPersonalizados_initializers = [];
    var _camposPersonalizados_extraInitializers = [];
    var _vendidos_decorators;
    var _vendidos_initializers = [];
    var _vendidos_extraInitializers = [];
    var _isActive_decorators;
    var _isActive_initializers = [];
    var _isActive_extraInitializers = [];
    var _countItems_decorators;
    var _countItems_initializers = [];
    var _countItems_extraInitializers = [];
    var _proveedorId_decorators;
    var _proveedorId_initializers = [];
    var _proveedorId_extraInitializers = [];
    var _proveedor_decorators;
    var _proveedor_initializers = [];
    var _proveedor_extraInitializers = [];
    var _warehouseStocks_decorators;
    var _warehouseStocks_initializers = [];
    var _warehouseStocks_extraInitializers = [];
    var _isComodato_decorators;
    var _isComodato_initializers = [];
    var _isComodato_extraInitializers = [];
    var _isSerialized_decorators;
    var _isSerialized_initializers = [];
    var _isSerialized_extraInitializers = [];
    var _seriales_decorators;
    var _seriales_initializers = [];
    var _seriales_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var Product = _classThis = /** @class */ (function () {
        function Product_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.nombre = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _nombre_initializers, void 0));
            this.codigo = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _codigo_initializers, void 0));
            this.modelo = (__runInitializers(this, _codigo_extraInitializers), __runInitializers(this, _modelo_initializers, void 0));
            this.serie = (__runInitializers(this, _modelo_extraInitializers), __runInitializers(this, _serie_initializers, void 0));
            this.categoria = (__runInitializers(this, _serie_extraInitializers), __runInitializers(this, _categoria_initializers, void 0));
            this.precio = (__runInitializers(this, _categoria_extraInitializers), __runInitializers(this, _precio_initializers, void 0));
            this.stock = (__runInitializers(this, _precio_extraInitializers), __runInitializers(this, _stock_initializers, void 0));
            // 💡 NUEVO CAMPO: Umbral de stock mínimo para alertas por producto.
            this.stockMinimo = (__runInitializers(this, _stock_extraInitializers), __runInitializers(this, _stockMinimo_initializers, void 0));
            // ─── Imagen ────────────────────────────────────────────────────────────────
            // Campo dedicado para URL o base64. Antes se guardaba dentro de
            // camposPersonalizados como { nombre: 'imagenProducto', valor: '...' }.
            // Ahora vive aquí directamente.
            this.imagen = (__runInitializers(this, _stockMinimo_extraInitializers), __runInitializers(this, _imagen_initializers, void 0));
            // ─── Almacén / Ubicación ───────────────────────────────────────────────────
            this.almacen = (__runInitializers(this, _imagen_extraInitializers), __runInitializers(this, _almacen_initializers, void 0));
            this.pasillo = (__runInitializers(this, _almacen_extraInitializers), __runInitializers(this, _pasillo_initializers, void 0));
            this.fila = (__runInitializers(this, _pasillo_extraInitializers), __runInitializers(this, _fila_initializers, void 0));
            // Campo combinado de ubicación (ej. "Pasillo A - Fila 3").
            // Se puede calcular en el servicio o dejar que el frontend lo envíe.
            this.ubicacion = (__runInitializers(this, _fila_extraInitializers), __runInitializers(this, _ubicacion_initializers, void 0));
            // ─── Unidad y movimiento ───────────────────────────────────────────────────
            this.unidadMedida = (__runInitializers(this, _ubicacion_extraInitializers), __runInitializers(this, _unidadMedida_initializers, void 0));
            this.movimientoInventario = (__runInitializers(this, _unidadMedida_extraInitializers), __runInitializers(this, _movimientoInventario_initializers, void 0));
            // ─── Descripción y campos personalizados ──────────────────────────────────
            this.descripcion = (__runInitializers(this, _movimientoInventario_extraInitializers), __runInitializers(this, _descripcion_initializers, void 0));
            this.nota = (__runInitializers(this, _descripcion_extraInitializers), __runInitializers(this, _nota_initializers, void 0));
            this.camposPersonalizados = (__runInitializers(this, _nota_extraInitializers), __runInitializers(this, _camposPersonalizados_initializers, void 0));
            // ─── Estadísticas ─────────────────────────────────────────────────────────
            this.vendidos = (__runInitializers(this, _camposPersonalizados_extraInitializers), __runInitializers(this, _vendidos_initializers, void 0));
            // ─── Estado ───────────────────────────────────────────────────────────────
            this.isActive = (__runInitializers(this, _vendidos_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
            // ─── Relación con conteos de inventario ───────────────────────────────────
            // Conecta Product directamente con CountItem en lugar de solo guardar
            // el id como número plano.
            this.countItems = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _countItems_initializers, void 0));
            this.proveedorId = (__runInitializers(this, _countItems_extraInitializers), __runInitializers(this, _proveedorId_initializers, void 0));
            this.proveedor = (__runInitializers(this, _proveedorId_extraInitializers), __runInitializers(this, _proveedor_initializers, void 0));
            // Relación para el stock desglosado por almacén
            this.warehouseStocks = (__runInitializers(this, _proveedor_extraInitializers), __runInitializers(this, _warehouseStocks_initializers, void 0));
            this.isComodato = (__runInitializers(this, _warehouseStocks_extraInitializers), __runInitializers(this, _isComodato_initializers, void 0));
            this.isSerialized = (__runInitializers(this, _isComodato_extraInitializers), __runInitializers(this, _isSerialized_initializers, void 0));
            // ─── Serials ──────────────────────────────────────────────────────────────
            this.seriales = (__runInitializers(this, _isSerialized_extraInitializers), __runInitializers(this, _seriales_initializers, void 0));
            // ─── Timestamps ───────────────────────────────────────────────────────────
            this.createdAt = (__runInitializers(this, _seriales_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
        return Product_1;
    }());
    __setFunctionName(_classThis, "Product");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _nombre_decorators = [(0, typeorm_1.Column)()];
        _codigo_decorators = [(0, typeorm_1.Column)({ unique: true, nullable: true })];
        _modelo_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _serie_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _categoria_decorators = [(0, typeorm_1.Column)({ default: 'General' })];
        _precio_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 })];
        _stock_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _stockMinimo_decorators = [(0, typeorm_1.Column)({ type: 'int', default: 5 })];
        _imagen_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _almacen_decorators = [(0, typeorm_1.Column)({ default: 'Principal', nullable: true })];
        _pasillo_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _fila_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _ubicacion_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _unidadMedida_decorators = [(0, typeorm_1.Column)({ default: 'Unidad', nullable: true })];
        _movimientoInventario_decorators = [(0, typeorm_1.Column)({ default: 'Entrada', nullable: true })];
        _descripcion_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _nota_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _camposPersonalizados_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', default: [], nullable: true })];
        _vendidos_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _isActive_decorators = [(0, typeorm_1.Column)({ default: true })];
        _countItems_decorators = [(0, typeorm_1.OneToMany)(function () { return count_item_entity_1.CountItem; }, function (item) { return item.productoId; }, { cascade: false })];
        _proveedorId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _proveedor_decorators = [(0, typeorm_1.ManyToOne)(function () { return provider_entity_1.Provider; }, { nullable: true, eager: true }), (0, typeorm_1.JoinColumn)({ name: 'proveedorId' })];
        _warehouseStocks_decorators = [(0, typeorm_1.OneToMany)(function () { return product_warehouse_stock_entity_1.ProductWarehouseStock; }, function (stock) { return stock.producto; }, { cascade: true, eager: true })];
        _isComodato_decorators = [(0, typeorm_1.Column)({ default: false })];
        _isSerialized_decorators = [(0, typeorm_1.Column)({ type: 'boolean', default: false })];
        _seriales_decorators = [(0, typeorm_1.OneToMany)(function () { return product_serial_entity_1.ProductSerial; }, function (serial) { return serial.producto; }, { cascade: true, eager: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: function (obj) { return "nombre" in obj; }, get: function (obj) { return obj.nombre; }, set: function (obj, value) { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
        __esDecorate(null, null, _codigo_decorators, { kind: "field", name: "codigo", static: false, private: false, access: { has: function (obj) { return "codigo" in obj; }, get: function (obj) { return obj.codigo; }, set: function (obj, value) { obj.codigo = value; } }, metadata: _metadata }, _codigo_initializers, _codigo_extraInitializers);
        __esDecorate(null, null, _modelo_decorators, { kind: "field", name: "modelo", static: false, private: false, access: { has: function (obj) { return "modelo" in obj; }, get: function (obj) { return obj.modelo; }, set: function (obj, value) { obj.modelo = value; } }, metadata: _metadata }, _modelo_initializers, _modelo_extraInitializers);
        __esDecorate(null, null, _serie_decorators, { kind: "field", name: "serie", static: false, private: false, access: { has: function (obj) { return "serie" in obj; }, get: function (obj) { return obj.serie; }, set: function (obj, value) { obj.serie = value; } }, metadata: _metadata }, _serie_initializers, _serie_extraInitializers);
        __esDecorate(null, null, _categoria_decorators, { kind: "field", name: "categoria", static: false, private: false, access: { has: function (obj) { return "categoria" in obj; }, get: function (obj) { return obj.categoria; }, set: function (obj, value) { obj.categoria = value; } }, metadata: _metadata }, _categoria_initializers, _categoria_extraInitializers);
        __esDecorate(null, null, _precio_decorators, { kind: "field", name: "precio", static: false, private: false, access: { has: function (obj) { return "precio" in obj; }, get: function (obj) { return obj.precio; }, set: function (obj, value) { obj.precio = value; } }, metadata: _metadata }, _precio_initializers, _precio_extraInitializers);
        __esDecorate(null, null, _stock_decorators, { kind: "field", name: "stock", static: false, private: false, access: { has: function (obj) { return "stock" in obj; }, get: function (obj) { return obj.stock; }, set: function (obj, value) { obj.stock = value; } }, metadata: _metadata }, _stock_initializers, _stock_extraInitializers);
        __esDecorate(null, null, _stockMinimo_decorators, { kind: "field", name: "stockMinimo", static: false, private: false, access: { has: function (obj) { return "stockMinimo" in obj; }, get: function (obj) { return obj.stockMinimo; }, set: function (obj, value) { obj.stockMinimo = value; } }, metadata: _metadata }, _stockMinimo_initializers, _stockMinimo_extraInitializers);
        __esDecorate(null, null, _imagen_decorators, { kind: "field", name: "imagen", static: false, private: false, access: { has: function (obj) { return "imagen" in obj; }, get: function (obj) { return obj.imagen; }, set: function (obj, value) { obj.imagen = value; } }, metadata: _metadata }, _imagen_initializers, _imagen_extraInitializers);
        __esDecorate(null, null, _almacen_decorators, { kind: "field", name: "almacen", static: false, private: false, access: { has: function (obj) { return "almacen" in obj; }, get: function (obj) { return obj.almacen; }, set: function (obj, value) { obj.almacen = value; } }, metadata: _metadata }, _almacen_initializers, _almacen_extraInitializers);
        __esDecorate(null, null, _pasillo_decorators, { kind: "field", name: "pasillo", static: false, private: false, access: { has: function (obj) { return "pasillo" in obj; }, get: function (obj) { return obj.pasillo; }, set: function (obj, value) { obj.pasillo = value; } }, metadata: _metadata }, _pasillo_initializers, _pasillo_extraInitializers);
        __esDecorate(null, null, _fila_decorators, { kind: "field", name: "fila", static: false, private: false, access: { has: function (obj) { return "fila" in obj; }, get: function (obj) { return obj.fila; }, set: function (obj, value) { obj.fila = value; } }, metadata: _metadata }, _fila_initializers, _fila_extraInitializers);
        __esDecorate(null, null, _ubicacion_decorators, { kind: "field", name: "ubicacion", static: false, private: false, access: { has: function (obj) { return "ubicacion" in obj; }, get: function (obj) { return obj.ubicacion; }, set: function (obj, value) { obj.ubicacion = value; } }, metadata: _metadata }, _ubicacion_initializers, _ubicacion_extraInitializers);
        __esDecorate(null, null, _unidadMedida_decorators, { kind: "field", name: "unidadMedida", static: false, private: false, access: { has: function (obj) { return "unidadMedida" in obj; }, get: function (obj) { return obj.unidadMedida; }, set: function (obj, value) { obj.unidadMedida = value; } }, metadata: _metadata }, _unidadMedida_initializers, _unidadMedida_extraInitializers);
        __esDecorate(null, null, _movimientoInventario_decorators, { kind: "field", name: "movimientoInventario", static: false, private: false, access: { has: function (obj) { return "movimientoInventario" in obj; }, get: function (obj) { return obj.movimientoInventario; }, set: function (obj, value) { obj.movimientoInventario = value; } }, metadata: _metadata }, _movimientoInventario_initializers, _movimientoInventario_extraInitializers);
        __esDecorate(null, null, _descripcion_decorators, { kind: "field", name: "descripcion", static: false, private: false, access: { has: function (obj) { return "descripcion" in obj; }, get: function (obj) { return obj.descripcion; }, set: function (obj, value) { obj.descripcion = value; } }, metadata: _metadata }, _descripcion_initializers, _descripcion_extraInitializers);
        __esDecorate(null, null, _nota_decorators, { kind: "field", name: "nota", static: false, private: false, access: { has: function (obj) { return "nota" in obj; }, get: function (obj) { return obj.nota; }, set: function (obj, value) { obj.nota = value; } }, metadata: _metadata }, _nota_initializers, _nota_extraInitializers);
        __esDecorate(null, null, _camposPersonalizados_decorators, { kind: "field", name: "camposPersonalizados", static: false, private: false, access: { has: function (obj) { return "camposPersonalizados" in obj; }, get: function (obj) { return obj.camposPersonalizados; }, set: function (obj, value) { obj.camposPersonalizados = value; } }, metadata: _metadata }, _camposPersonalizados_initializers, _camposPersonalizados_extraInitializers);
        __esDecorate(null, null, _vendidos_decorators, { kind: "field", name: "vendidos", static: false, private: false, access: { has: function (obj) { return "vendidos" in obj; }, get: function (obj) { return obj.vendidos; }, set: function (obj, value) { obj.vendidos = value; } }, metadata: _metadata }, _vendidos_initializers, _vendidos_extraInitializers);
        __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: function (obj) { return "isActive" in obj; }, get: function (obj) { return obj.isActive; }, set: function (obj, value) { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
        __esDecorate(null, null, _countItems_decorators, { kind: "field", name: "countItems", static: false, private: false, access: { has: function (obj) { return "countItems" in obj; }, get: function (obj) { return obj.countItems; }, set: function (obj, value) { obj.countItems = value; } }, metadata: _metadata }, _countItems_initializers, _countItems_extraInitializers);
        __esDecorate(null, null, _proveedorId_decorators, { kind: "field", name: "proveedorId", static: false, private: false, access: { has: function (obj) { return "proveedorId" in obj; }, get: function (obj) { return obj.proveedorId; }, set: function (obj, value) { obj.proveedorId = value; } }, metadata: _metadata }, _proveedorId_initializers, _proveedorId_extraInitializers);
        __esDecorate(null, null, _proveedor_decorators, { kind: "field", name: "proveedor", static: false, private: false, access: { has: function (obj) { return "proveedor" in obj; }, get: function (obj) { return obj.proveedor; }, set: function (obj, value) { obj.proveedor = value; } }, metadata: _metadata }, _proveedor_initializers, _proveedor_extraInitializers);
        __esDecorate(null, null, _warehouseStocks_decorators, { kind: "field", name: "warehouseStocks", static: false, private: false, access: { has: function (obj) { return "warehouseStocks" in obj; }, get: function (obj) { return obj.warehouseStocks; }, set: function (obj, value) { obj.warehouseStocks = value; } }, metadata: _metadata }, _warehouseStocks_initializers, _warehouseStocks_extraInitializers);
        __esDecorate(null, null, _isComodato_decorators, { kind: "field", name: "isComodato", static: false, private: false, access: { has: function (obj) { return "isComodato" in obj; }, get: function (obj) { return obj.isComodato; }, set: function (obj, value) { obj.isComodato = value; } }, metadata: _metadata }, _isComodato_initializers, _isComodato_extraInitializers);
        __esDecorate(null, null, _isSerialized_decorators, { kind: "field", name: "isSerialized", static: false, private: false, access: { has: function (obj) { return "isSerialized" in obj; }, get: function (obj) { return obj.isSerialized; }, set: function (obj, value) { obj.isSerialized = value; } }, metadata: _metadata }, _isSerialized_initializers, _isSerialized_extraInitializers);
        __esDecorate(null, null, _seriales_decorators, { kind: "field", name: "seriales", static: false, private: false, access: { has: function (obj) { return "seriales" in obj; }, get: function (obj) { return obj.seriales; }, set: function (obj, value) { obj.seriales = value; } }, metadata: _metadata }, _seriales_initializers, _seriales_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Product = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Product = _classThis;
}();
exports.Product = Product;
