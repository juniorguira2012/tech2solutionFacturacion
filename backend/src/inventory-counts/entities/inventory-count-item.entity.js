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
exports.InventoryCountItem = void 0;
const typeorm_1 = require("typeorm");
const inventory_count_entity_1 = require("./inventory-count.entity");
let InventoryCountItem = class InventoryCountItem {
    id;
    productoId;
    productoNombre;
    codigo;
    cantidadContada;
    cantidadSistema;
    precioUnitario;
    unidadMedida;
    diferencia;
    costoVariacion;
    inventoryCount;
};
exports.InventoryCountItem = InventoryCountItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InventoryCountItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], InventoryCountItem.prototype, "productoId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InventoryCountItem.prototype, "productoNombre", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InventoryCountItem.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], InventoryCountItem.prototype, "cantidadContada", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], InventoryCountItem.prototype, "cantidadSistema", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], InventoryCountItem.prototype, "precioUnitario", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Unidad' }),
    __metadata("design:type", String)
], InventoryCountItem.prototype, "unidadMedida", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], InventoryCountItem.prototype, "diferencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], InventoryCountItem.prototype, "costoVariacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inventory_count_entity_1.InventoryCount, (count) => count.items, { onDelete: 'CASCADE' }),
    __metadata("design:type", inventory_count_entity_1.InventoryCount)
], InventoryCountItem.prototype, "inventoryCount", void 0);
exports.InventoryCountItem = InventoryCountItem = __decorate([
    (0, typeorm_1.Entity)('inventory_count_items')
], InventoryCountItem);
//# sourceMappingURL=inventory-count-item.entity.js.map