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
exports.ProductSerialsController = void 0;
const common_1 = require("@nestjs/common");
const product_serials_service_1 = require("./product-serials.service");
const update_product_serial_dto_1 = require("./dto/update-product-serial.dto");
let ProductSerialsController = class ProductSerialsController {
    serialsService;
    constructor(serialsService) {
        this.serialsService = serialsService;
    }
    findAll(page, limit) {
        return this.serialsService.findAll(page, limit);
    }
    findOne(id) {
        return this.serialsService.findOne(id);
    }
    findByProductId(productId, page, limit) {
        return this.serialsService.findByProductId(productId, page, limit);
    }
    updateSerialNumber(id, updateDto) {
        return this.serialsService.updateSerialNumber(id, updateDto);
    }
    updateStatus(id, updateDto) {
        if (!updateDto.status) {
            throw new common_1.BadRequestException('El campo "status" es requerido para esta operación.');
        }
        return this.serialsService.updateStatus(id, updateDto.status);
    }
};
exports.ProductSerialsController = ProductSerialsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ProductSerialsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductSerialsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('/product/:productId'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", void 0)
], ProductSerialsController.prototype, "findByProductId", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_serial_dto_1.UpdateProductSerialDto]),
    __metadata("design:returntype", void 0)
], ProductSerialsController.prototype, "updateSerialNumber", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_serial_dto_1.UpdateProductSerialDto]),
    __metadata("design:returntype", void 0)
], ProductSerialsController.prototype, "updateStatus", null);
exports.ProductSerialsController = ProductSerialsController = __decorate([
    (0, common_1.Controller)('product-serials'),
    __metadata("design:paramtypes", [product_serials_service_1.ProductSerialsService])
], ProductSerialsController);
//# sourceMappingURL=product-serials.controller.js.map