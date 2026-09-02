"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const path = __importStar(require("path"));
const common_2 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const products_module_1 = require("./products/products.module");
const inventory_counts_module_1 = require("./inventory-counts/inventory-counts.module");
const movements_module_1 = require("./movements/movements.module");
const sales_module_1 = require("./sales/sales.module");
const providers_module_1 = require("./providers/providers.module");
const warehouses_module_1 = require("./movements/warehouses.module");
const users_module_1 = require("./user/users.module");
const clients_module_1 = require("./client/clients.module");
const roles_module_1 = require("./roles/roles.module");
const comodatos_module_1 = require("./comodatos/comodatos.module");
const units_of_measure_module_1 = require("./units-of-measure/units-of-measure.module");
const product_serials_module_1 = require("./products/product-serials.module");
const categories_module_1 = require("./categories/categories.module");
const database_module_1 = require("./database/database.module");
const schedule_1 = require("@nestjs/schedule");
const inventory_batches_module_1 = require("./inventory-batches/inventory-batches.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: [
                    path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`),
                    path.resolve(__dirname, '../../.env'),
                ],
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const logger = new common_2.Logger('TypeOrmModule');
                    const rawSync = configService.get('DATABASE_SYNCHRONIZE');
                    const synchronize = rawSync === 'true';
                    if (synchronize) {
                        logger.warn('DATABASE_SYNCHRONIZE está habilitado. No usar en producción.');
                    }
                    return {
                        type: 'postgres',
                        host: configService.get('DATABASE_HOST', 'localhost'),
                        port: Number(configService.get('DATABASE_PORT', 5432)),
                        username: configService.get('DATABASE_USER', 'postgres'),
                        password: configService.get('DATABASE_PASSWORD', 'postgres'),
                        database: configService.get('DATABASE_NAME', 'tech_two_solution_db'),
                        autoLoadEntities: true,
                        synchronize,
                        logging: configService.get('NODE_ENV') !== 'production',
                    };
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            products_module_1.ProductsModule,
            inventory_counts_module_1.InventoryCountsModule,
            movements_module_1.MovementsModule,
            sales_module_1.SalesModule,
            providers_module_1.ProvidersModule,
            warehouses_module_1.WarehousesModule,
            users_module_1.UsersModule,
            clients_module_1.ClientsModule,
            roles_module_1.RolesModule,
            comodatos_module_1.ComodatosModule,
            units_of_measure_module_1.UnitsOfMeasureModule,
            product_serials_module_1.ProductSerialsModule,
            categories_module_1.CategoriesModule,
            database_module_1.DatabaseModule,
            inventory_batches_module_1.InventoryBatchesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map