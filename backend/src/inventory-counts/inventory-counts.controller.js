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
exports.InventoryCountsController = exports.UpdateCountItemDto = exports.AddCountItemDto = exports.CreateInventoryCountDto = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const inventory_counts_service_1 = require("./inventory-counts.service");
class CreateInventoryCountDto {
    almacen;
    descripcion;
}
exports.CreateInventoryCountDto = CreateInventoryCountDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryCountDto.prototype, "almacen", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInventoryCountDto.prototype, "descripcion", void 0);
class AddCountItemDto {
    productoId;
    cantidadContada;
}
exports.AddCountItemDto = AddCountItemDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AddCountItemDto.prototype, "productoId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AddCountItemDto.prototype, "cantidadContada", void 0);
class UpdateCountItemDto {
    cantidadContada;
}
exports.UpdateCountItemDto = UpdateCountItemDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateCountItemDto.prototype, "cantidadContada", void 0);
let InventoryCountsController = class InventoryCountsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async createInventoryCount(dto, userId, userRole, permission) {
        if (permission !== 'full') {
            throw new common_1.UnauthorizedException('Solo usuarios con permiso "full" pueden crear conteos');
        }
        if (!userId) {
            throw new common_1.UnauthorizedException('Usuario no identificado');
        }
        return this.service.create({
            ...dto,
        }, { id: userId, rol: userRole });
    }
    async listInventoryCounts(almacen, permission) {
        if (!permission || (permission !== 'full' && permission !== 'view')) {
            throw new common_1.UnauthorizedException('No tienes permiso para acceder a los conteos');
        }
        return this.service.findAll(almacen);
    }
    async getInventoryCount(id, permission) {
        if (!permission || (permission !== 'full' && permission !== 'view')) {
            throw new common_1.UnauthorizedException('No tienes permiso para acceder a este conteo');
        }
        return this.service.findOne(Number(id));
    }
    async addCountItem(id, dto, userId, permission) {
        if (permission !== 'full') {
            throw new common_1.UnauthorizedException('Solo usuarios con permiso "full" pueden agregar items al conteo');
        }
        if (!userId) {
            throw new common_1.UnauthorizedException('Usuario no identificado');
        }
        return this.service.addProductToCount(Number(id), dto);
    }
    async updateCountItem(id, itemId, dto, userId, permission) {
        if (permission !== 'full') {
            throw new common_1.UnauthorizedException('Solo usuarios con permiso "full" pueden actualizar items');
        }
        if (!userId) {
            throw new common_1.UnauthorizedException('Usuario no identificado');
        }
        if (typeof dto.cantidadContada !== 'number' || dto.cantidadContada < 0) {
            throw new common_1.BadRequestException('La cantidad debe ser un número no negativo');
        }
        return this.service.updateCountItem(Number(id), Number(itemId), dto);
    }
    async publishInventoryCount(id, userId, permission) {
        if (permission !== 'full') {
            throw new common_1.UnauthorizedException('Solo usuarios con permiso "full" pueden publicar conteos');
        }
        if (!userId) {
            throw new common_1.UnauthorizedException('Usuario no identificado');
        }
        return this.service.publishAdjustments(Number(id));
    }
    async cancelInventoryCount(id, userId, permission) {
        if (permission !== 'full') {
            throw new common_1.UnauthorizedException('Solo usuarios con permiso "full" pueden cancelar conteos');
        }
        if (!userId) {
            throw new common_1.UnauthorizedException('Usuario no identificado');
        }
        return this.service.cancelCount(Number(id));
    }
    async removeInventoryCount(id, userId, userRole, permission) {
        if (userRole !== 'admin' && permission !== 'full') {
            throw new common_1.UnauthorizedException('Solo administradores pueden eliminar auditorías físicas');
        }
        return this.service.remove(Number(id), userId);
    }
};
exports.InventoryCountsController = InventoryCountsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Headers)('x-user-role')),
    __param(3, (0, common_1.Headers)('x-inventory-permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateInventoryCountDto, Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryCountsController.prototype, "createInventoryCount", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('almacen')),
    __param(1, (0, common_1.Headers)('x-inventory-permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryCountsController.prototype, "listInventoryCounts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-inventory-permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryCountsController.prototype, "getInventoryCount", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __param(3, (0, common_1.Headers)('x-inventory-permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AddCountItemDto, Object, String]),
    __metadata("design:returntype", Promise)
], InventoryCountsController.prototype, "addCountItem", null);
__decorate([
    (0, common_1.Patch)(':id/items/:itemId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('x-user-id')),
    __param(4, (0, common_1.Headers)('x-inventory-permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, UpdateCountItemDto, Object, String]),
    __metadata("design:returntype", Promise)
], InventoryCountsController.prototype, "updateCountItem", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Headers)('x-inventory-permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], InventoryCountsController.prototype, "publishInventoryCount", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Headers)('x-inventory-permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryCountsController.prototype, "cancelInventoryCount", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Headers)('x-user-role')),
    __param(3, (0, common_1.Headers)('x-inventory-permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryCountsController.prototype, "removeInventoryCount", null);
exports.InventoryCountsController = InventoryCountsController = __decorate([
    (0, common_1.Controller)('inventory-counts'),
    __metadata("design:paramtypes", [inventory_counts_service_1.InventoryCountsService])
], InventoryCountsController);
//# sourceMappingURL=inventory-counts.controller.js.map