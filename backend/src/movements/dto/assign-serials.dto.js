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
exports.AssignSerialsToTechnicianDto = void 0;
const class_validator_1 = require("class-validator");
class AssignSerialsToTechnicianDto {
    technicianId;
    serials;
    usuarioId;
}
exports.AssignSerialsToTechnicianDto = AssignSerialsToTechnicianDto;
__decorate([
    (0, class_validator_1.IsInt)({ message: 'El ID del técnico debe ser un número.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Debe proporcionar un técnico.' }),
    __metadata("design:type", Number)
], AssignSerialsToTechnicianDto.prototype, "technicianId", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Los seriales deben ser un arreglo.' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Cada serial debe ser un texto.' }),
    (0, class_validator_1.IsNotEmpty)({ each: true, message: 'No se permiten seriales vacíos.' }),
    __metadata("design:type", Array)
], AssignSerialsToTechnicianDto.prototype, "serials", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], AssignSerialsToTechnicianDto.prototype, "usuarioId", void 0);
//# sourceMappingURL=assign-serials.dto.js.map