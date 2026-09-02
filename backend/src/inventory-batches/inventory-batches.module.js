"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryBatchesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const inventory_batches_service_1 = require("./inventory-batches.service");
const inventory_batches_controller_1 = require("./inventory-batches.controller");
const inventory_batch_entity_1 = require("./entities/inventory-batch.entity");
const product_entity_1 = require("../products/entities/product.entity");
let InventoryBatchesModule = class InventoryBatchesModule {
};
exports.InventoryBatchesModule = InventoryBatchesModule;
exports.InventoryBatchesModule = InventoryBatchesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([inventory_batch_entity_1.InventoryBatch, product_entity_1.Product])
        ],
        controllers: [inventory_batches_controller_1.InventoryBatchesController],
        providers: [inventory_batches_service_1.InventoryBatchesService],
        exports: [inventory_batches_service_1.InventoryBatchesService],
    })
], InventoryBatchesModule);
//# sourceMappingURL=inventory-batches.module.js.map