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
exports.InventoryBatchesController = void 0;
const common_1 = require("@nestjs/common");
const inventory_batches_service_1 = require("./inventory-batches.service");
const create_inventory_batch_dto_1 = require("./dto/create-inventory-batch.dto");
const update_inventory_batch_dto_1 = require("./dto/update-inventory-batch.dto");
let InventoryBatchesController = class InventoryBatchesController {
    batchesService;
    constructor(batchesService) {
        this.batchesService = batchesService;
    }
    findAll() {
        return this.batchesService.findAllBatches();
    }
    create(createDto) {
        return this.batchesService.createBatch(createDto);
    }
    update(id, updateDto) {
        return this.batchesService.updateBatch(id, updateDto);
    }
    remove(id) {
        return this.batchesService.removeBatch(id);
    }
};
exports.InventoryBatchesController = InventoryBatchesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryBatchesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_inventory_batch_dto_1.CreateInventoryBatchDto]),
    __metadata("design:returntype", void 0)
], InventoryBatchesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_inventory_batch_dto_1.UpdateInventoryBatchDto]),
    __metadata("design:returntype", void 0)
], InventoryBatchesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventoryBatchesController.prototype, "remove", null);
exports.InventoryBatchesController = InventoryBatchesController = __decorate([
    (0, common_1.Controller)('inventory-batches'),
    __metadata("design:paramtypes", [inventory_batches_service_1.InventoryBatchesService])
], InventoryBatchesController);
//# sourceMappingURL=inventory-batches.controller.js.map