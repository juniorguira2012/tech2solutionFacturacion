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
exports.InventoryBatch = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const product_entity_1 = require("../../products/entities/product.entity");
let InventoryBatch = class InventoryBatch {
    id;
    numeroLote;
    cantidad;
    almacen;
    fechaVencimiento;
    producto;
    createdAt;
    updatedAt;
};
exports.InventoryBatch = InventoryBatch;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InventoryBatch.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'lote' }),
    (0, typeorm_1.Column)({ name: 'numero_lote', type: 'varchar', length: 100, nullable: true, default: 'Sin Lote' }),
    __metadata("design:type", String)
], InventoryBatch.prototype, "numeroLote", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventoryBatch.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, default: 'Principal' }),
    __metadata("design:type", String)
], InventoryBatch.prototype, "almacen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_vencimiento', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], InventoryBatch.prototype, "fechaVencimiento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'producto_id' }),
    __metadata("design:type", product_entity_1.Product)
], InventoryBatch.prototype, "producto", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], InventoryBatch.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], InventoryBatch.prototype, "updatedAt", void 0);
exports.InventoryBatch = InventoryBatch = __decorate([
    (0, typeorm_1.Entity)('inventory_batches')
], InventoryBatch);
//# sourceMappingURL=inventory-batch.entity.js.map