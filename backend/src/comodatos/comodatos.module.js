"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComodatosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const comodato_entity_1 = require("./entities/comodato.entity");
const product_entity_1 = require("../products/entities/product.entity");
const comodatos_service_1 = require("./comodatos.service");
const comodatos_controller_1 = require("./comodatos.controller");
const providers_module_1 = require("../providers/providers.module");
let ComodatosModule = class ComodatosModule {
};
exports.ComodatosModule = ComodatosModule;
exports.ComodatosModule = ComodatosModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([comodato_entity_1.Comodato, product_entity_1.Product]),
            providers_module_1.ProvidersModule,
        ],
        providers: [comodatos_service_1.ComodatosService],
        controllers: [comodatos_controller_1.ComodatosController],
        exports: [comodatos_service_1.ComodatosService, typeorm_1.TypeOrmModule],
    })
], ComodatosModule);
//# sourceMappingURL=comodatos.module.js.map