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
exports.UpdateProductSerialDto = void 0;
const class_validator_1 = require("class-validator");
const product_serial_entity_1 = require("../entities/product-serial.entity");
class UpdateProductSerialDto {
    serialNumber;
    status;
}
exports.UpdateProductSerialDto = UpdateProductSerialDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El número de serie debe ser una cadena de texto.' }),
    (0, class_validator_1.MinLength)(1, { message: 'El número de serie no puede estar vacío.' }),
    __metadata("design:type", String)
], UpdateProductSerialDto.prototype, "serialNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(product_serial_entity_1.SerialStatus, { message: 'El estado proporcionado no es válido.' }),
    __metadata("design:type", String)
], UpdateProductSerialDto.prototype, "status", void 0);
//# sourceMappingURL=update-product-serial.dto.js.map