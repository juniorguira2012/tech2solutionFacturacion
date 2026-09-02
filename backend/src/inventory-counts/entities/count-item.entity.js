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
exports.CountItem = void 0;
const typeorm_1 = require("typeorm");
const inventory_count_entity_1 = require("./inventory-count.entity");
let CountItem = class CountItem {
    id;
    conteo;
    productoId;
    productoNombre;
    codigo;
    cantidadSistema;
    cantidadContada;
    precioUnitario;
    unidadMedida;
    createdAt;
    updatedAt;
    get diferencia() {
        if (this.cantidadContada === null || this.cantidadContada === undefined) {
            return 0;
        }
        return this.cantidadContada - this.cantidadSistema;
    }
    get costoVariacion() {
        return this.diferencia * Number(this.precioUnitario);
    }
};
exports.CountItem = CountItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CountItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inventory_count_entity_1.InventoryCount, (conteo) => conteo.items, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", inventory_count_entity_1.InventoryCount)
], CountItem.prototype, "conteo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CountItem.prototype, "productoId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CountItem.prototype, "productoNombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CountItem.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CountItem.prototype, "cantidadSistema", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CountItem.prototype, "cantidadContada", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CountItem.prototype, "precioUnitario", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CountItem.prototype, "unidadMedida", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CountItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CountItem.prototype, "updatedAt", void 0);
exports.CountItem = CountItem = __decorate([
    (0, typeorm_1.Entity)('count_items')
], CountItem);
//# sourceMappingURL=count-item.entity.js.map