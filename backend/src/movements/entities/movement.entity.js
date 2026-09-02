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
exports.Movement = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("../../products/entities/product.entity");
const technician_entity_1 = require("./technician.entity");
const user_entity_1 = require("../../user/dto/entities/user.entity");
let Movement = class Movement {
    id;
    productoId;
    producto;
    tipo;
    cantidad;
    nota;
    nuevoStock;
    costoUnitario;
    referencia;
    usuarioId;
    usuario;
    technicianId;
    technician;
    almacenOrigen;
    almacenDestino;
    createdAt;
};
exports.Movement = Movement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Movement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Movement.prototype, "productoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: 'productoId' }),
    __metadata("design:type", product_entity_1.Product)
], Movement.prototype, "producto", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Movement.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Movement.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Movement.prototype, "nota", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Movement.prototype, "nuevoStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Movement.prototype, "costoUnitario", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Movement.prototype, "referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Movement.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'usuarioId' }),
    __metadata("design:type", user_entity_1.User)
], Movement.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Movement.prototype, "technicianId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => technician_entity_1.Technician, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'technicianId' }),
    __metadata("design:type", technician_entity_1.Technician)
], Movement.prototype, "technician", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Movement.prototype, "almacenOrigen", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Movement.prototype, "almacenDestino", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Movement.prototype, "createdAt", void 0);
exports.Movement = Movement = __decorate([
    (0, typeorm_1.Entity)('movements')
], Movement);
//# sourceMappingURL=movement.entity.js.map