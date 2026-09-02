"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const typeorm_1 = require("typeorm");
const count_item_entity_1 = require("../../inventory-counts/entities/count-item.entity");
const product_warehouse_stock_entity_1 = require("./product-warehouse-stock.entity");
const provider_entity_1 = require("../../providers/entities/provider.entity");
const product_serial_entity_1 = require("./product-serial.entity");
let Product = class Product {
    id;
    nombre;
    codigo;
    modelo;
    serie;
    categoria;
    precio;
    stock;
    stockMinimo;
    imagen;
    almacen;
    pasillo;
    fila;
    ubicacion;
    unidadMedida;
    movimientoInventario;
    descripcion;
    nota;
    camposPersonalizados;
    vendidos;
    isActive;
    countItems;
    proveedorId;
    proveedor;
    warehouseStocks;
    isComodato;
    isSerialized;
    seriales;
    createdAt;
    updatedAt;
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "modelo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "serie", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'General' }),
    __metadata("design:type", String)
], Product.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Product.prototype, "precio", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 5 }),
    __metadata("design:type", Number)
], Product.prototype, "stockMinimo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "imagen", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Principal', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "almacen", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "pasillo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "fila", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "ubicacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Unidad', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "unidadMedida", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Entrada', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "movimientoInventario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "nota", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [], nullable: true }),
    __metadata("design:type", Array)
], Product.prototype, "camposPersonalizados", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "vendidos", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Product.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => count_item_entity_1.CountItem, (item) => item.productoId, { cascade: false }),
    __metadata("design:type", Array)
], Product.prototype, "countItems", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "proveedorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => provider_entity_1.Provider, { nullable: true, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'proveedorId' }),
    __metadata("design:type", provider_entity_1.Provider)
], Product.prototype, "proveedor", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_warehouse_stock_entity_1.ProductWarehouseStock, (stock) => stock.producto, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], Product.prototype, "warehouseStocks", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "isComodato", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "isSerialized", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_serial_entity_1.ProductSerial, (serial) => serial.producto, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], Product.prototype, "seriales", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Product.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Product.prototype, "updatedAt", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)('products')
], Product);
//# sourceMappingURL=product.entity.js.map