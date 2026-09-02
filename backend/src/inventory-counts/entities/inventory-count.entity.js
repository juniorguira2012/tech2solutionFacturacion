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
exports.InventoryCount = exports.ConteoEstado = void 0;
const typeorm_1 = require("typeorm");
const count_item_entity_1 = require("./count-item.entity");
var ConteoEstado;
(function (ConteoEstado) {
    ConteoEstado["EN_PROGRESO"] = "EN_PROGRESO";
    ConteoEstado["AJUSTES_PUBLICADOS"] = "Ajustes Publicados";
    ConteoEstado["CANCELADO"] = "CANCELADO";
})(ConteoEstado || (exports.ConteoEstado = ConteoEstado = {}));
let InventoryCount = class InventoryCount {
    id;
    almacen;
    descripcion;
    estado;
    totalProductos;
    totalVariacion;
    items;
    createdAt;
};
exports.InventoryCount = InventoryCount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InventoryCount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InventoryCount.prototype, "almacen", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InventoryCount.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ConteoEstado,
        default: ConteoEstado.EN_PROGRESO,
    }),
    __metadata("design:type", String)
], InventoryCount.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventoryCount.prototype, "totalProductos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], InventoryCount.prototype, "totalVariacion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => count_item_entity_1.CountItem, (item) => item.conteo, { cascade: true }),
    __metadata("design:type", Array)
], InventoryCount.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InventoryCount.prototype, "createdAt", void 0);
exports.InventoryCount = InventoryCount = __decorate([
    (0, typeorm_1.Entity)('inventory_counts')
], InventoryCount);
//# sourceMappingURL=inventory-count.entity.js.map