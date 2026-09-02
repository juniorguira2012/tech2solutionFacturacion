"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSerialsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const product_serial_entity_1 = require("./entities/product-serial.entity");
const product_serials_service_1 = require("./product-serials.service");
const product_serials_controller_1 = require("./product-serials.controller");
const product_entity_1 = require("./entities/product.entity");
let ProductSerialsModule = class ProductSerialsModule {
};
exports.ProductSerialsModule = ProductSerialsModule;
exports.ProductSerialsModule = ProductSerialsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([product_serial_entity_1.ProductSerial, product_entity_1.Product])],
        providers: [product_serials_service_1.ProductSerialsService],
        controllers: [product_serials_controller_1.ProductSerialsController],
        exports: [product_serials_service_1.ProductSerialsService],
    })
], ProductSerialsModule);
//# sourceMappingURL=product-serials.module.js.map