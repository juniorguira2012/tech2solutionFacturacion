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
exports.ProductWarehouseStock = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
let ProductWarehouseStock = class ProductWarehouseStock {
    id;
    productoId;
    almacen;
    cantidad;
    producto;
};
exports.ProductWarehouseStock = ProductWarehouseStock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProductWarehouseStock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ProductWarehouseStock.prototype, "productoId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProductWarehouseStock.prototype, "almacen", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], ProductWarehouseStock.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, (product) => product.warehouseStocks, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'productoId' }),
    __metadata("design:type", product_entity_1.Product)
], ProductWarehouseStock.prototype, "producto", void 0);
exports.ProductWarehouseStock = ProductWarehouseStock = __decorate([
    (0, typeorm_1.Entity)('product_warehouse_stock'),
    (0, typeorm_1.Unique)(['productoId', 'almacen'])
], ProductWarehouseStock);
//# sourceMappingURL=product-warehouse-stock.entity.js.map