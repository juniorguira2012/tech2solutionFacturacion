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
exports.ProductSerial = exports.SerialStatus = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
var SerialStatus;
(function (SerialStatus) {
    SerialStatus["DISPONIBLE"] = "disponible";
    SerialStatus["VENDIDO"] = "vendido";
    SerialStatus["EN_REPARACION"] = "en_reparacion";
    SerialStatus["DESCARTADO"] = "descartado";
    SerialStatus["EN_COMODATO"] = "en_comodato";
    SerialStatus["ASIGNADO_TECNICO"] = "asignado_tecnico";
})(SerialStatus || (exports.SerialStatus = SerialStatus = {}));
let ProductSerial = class ProductSerial {
    id;
    serialNumber;
    producto;
    productoId;
    status;
    almacen;
    nota;
    lastReturnNote;
    createdAt;
    updatedAt;
};
exports.ProductSerial = ProductSerial;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProductSerial.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], ProductSerial.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, (product) => product.seriales, { onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'productoId' }),
    __metadata("design:type", product_entity_1.Product)
], ProductSerial.prototype, "producto", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ProductSerial.prototype, "productoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SerialStatus, default: SerialStatus.DISPONIBLE }),
    __metadata("design:type", String)
], ProductSerial.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, comment: 'Almacén donde se encuentra físicamente el serial' }),
    __metadata("design:type", String)
], ProductSerial.prototype, "almacen", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: 'Nota general o de entrega del serial' }),
    __metadata("design:type", String)
], ProductSerial.prototype, "nota", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: 'Última nota de devolución registrada por el técnico' }),
    __metadata("design:type", Object)
], ProductSerial.prototype, "lastReturnNote", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProductSerial.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProductSerial.prototype, "updatedAt", void 0);
exports.ProductSerial = ProductSerial = __decorate([
    (0, typeorm_1.Entity)('product_serials'),
    (0, typeorm_1.Index)(['serialNumber', 'productoId'], { unique: true })
], ProductSerial);
//# sourceMappingURL=product-serial.entity.js.map