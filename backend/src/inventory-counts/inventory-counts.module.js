"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryCountsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const inventory_counts_service_1 = require("./inventory-counts.service");
const inventory_counts_controller_1 = require("./inventory-counts.controller");
const inventory_count_entity_1 = require("./entities/inventory-count.entity");
const count_item_entity_1 = require("./entities/count-item.entity");
const product_entity_1 = require("../products/entities/product.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
let InventoryCountsModule = class InventoryCountsModule {
};
exports.InventoryCountsModule = InventoryCountsModule;
exports.InventoryCountsModule = InventoryCountsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([inventory_count_entity_1.InventoryCount, count_item_entity_1.CountItem, product_entity_1.Product, audit_log_entity_1.AuditLog])],
        controllers: [inventory_counts_controller_1.InventoryCountsController],
        providers: [inventory_counts_service_1.InventoryCountsService],
        exports: [inventory_counts_service_1.InventoryCountsService],
    })
], InventoryCountsModule);
//# sourceMappingURL=inventory-counts.module.js.map