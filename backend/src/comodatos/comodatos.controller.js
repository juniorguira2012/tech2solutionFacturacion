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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComodatosController = void 0;
const common_1 = require("@nestjs/common");
const comodatos_service_1 = require("./comodatos.service");
const create_comodato_dto_1 = require("./dto/create-comodato.dto");
const update_comodato_dto_1 = require("./dto/update-comodato.dto");
let ComodatosController = class ComodatosController {
    comodatosService;
    constructor(comodatosService) {
        this.comodatosService = comodatosService;
    }
    async create(createComodatoDto) {
        return await this.comodatosService.create(createComodatoDto);
    }
    async findAll() {
        return await this.comodatosService.findAll();
    }
    async findOne(id) {
        return await this.comodatosService.findOne(+id);
    }
    async devolver(id) {
        return await this.comodatosService.devolverComodato(+id);
    }
    async update(id, updateComodatoDto) {
        return await this.comodatosService.update(+id, updateComodatoDto);
    }
    async remove(id) {
        return await this.comodatosService.remove(+id);
    }
};
exports.ComodatosController = ComodatosController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_comodato_dto_1.CreateComodatoDto]),
    __metadata("design:returntype", Promise)
], ComodatosController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComodatosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComodatosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/devolver'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComodatosController.prototype, "devolver", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_comodato_dto_1.UpdateComodatoDto]),
    __metadata("design:returntype", Promise)
], ComodatosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComodatosController.prototype, "remove", null);
exports.ComodatosController = ComodatosController = __decorate([
    (0, common_1.Controller)('comodatos'),
    __metadata("design:paramtypes", [comodatos_service_1.ComodatosService])
], ComodatosController);
//# sourceMappingURL=comodatos.controller.js.map