"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const movements_service_1 = require("./movements.service");
const movements_controller_1 = require("./movements.controller");
const movement_entity_1 = require("./entities/movement.entity");
const product_entity_1 = require("../products/entities/product.entity");
const product_warehouse_stock_entity_1 = require("../products/entities/product-warehouse-stock.entity");
const inventory_batch_entity_1 = require("./entities/inventory-batch.entity");
const technician_entity_1 = require("./entities/technician.entity");
const product_serial_entity_1 = require("../products/entities/product-serial.entity");
const user_entity_1 = require("../user/dto/entities/user.entity");
let MovementsModule = class MovementsModule {
};
exports.MovementsModule = MovementsModule;
exports.MovementsModule = MovementsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([movement_entity_1.Movement, product_entity_1.Product, product_warehouse_stock_entity_1.ProductWarehouseStock, inventory_batch_entity_1.InventoryBatch, technician_entity_1.Technician, product_serial_entity_1.ProductSerial, user_entity_1.User]),
        ],
        controllers: [movements_controller_1.MovementsController],
        providers: [movements_service_1.MovementsService],
        exports: [movements_service_1.MovementsService, typeorm_1.TypeOrmModule],
    })
], MovementsModule);
//# sourceMappingURL=movements.module.js.map