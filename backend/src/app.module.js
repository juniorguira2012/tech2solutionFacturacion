"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
// src/app.module.ts
var common_1 = require("@nestjs/common");
var path = require("path");
var common_2 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var typeorm_1 = require("@nestjs/typeorm");
var products_module_1 = require("./products/products.module");
var inventory_counts_module_1 = require("./inventory-counts/inventory-counts.module");
var movements_module_1 = require("./movements/movements.module");
var sales_module_1 = require("./sales/sales.module");
var providers_module_1 = require("./providers/providers.module");
var warehouses_module_1 = require("./movements/warehouses.module");
var users_module_1 = require("./user/users.module");
var clients_module_1 = require("./client/clients.module");
var roles_module_1 = require("./roles/roles.module");
var comodatos_module_1 = require("./comodatos/comodatos.module");
var units_of_measure_module_1 = require("./units-of-measure/units-of-measure.module");
var product_serials_module_1 = require("./products/product-serials.module");
var categories_module_1 = require("./categories/categories.module");
var database_module_1 = require("./database/database.module");
var schedule_1 = require("@nestjs/schedule"); // 🌟 Importado correctamente
var inventory_batches_module_1 = require("./inventory-batches/inventory-batches.module"); // 🌟 Importado correctamente
var AppModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                config_1.ConfigModule.forRoot({
                    envFilePath: [
                        path.resolve(__dirname, "../../.env.".concat(process.env.NODE_ENV)),
                        path.resolve(__dirname, '../.env'),
                        path.resolve(__dirname, '../../.env'),
                    ],
                    isGlobal: true,
                }),
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: function (configService) {
                        var logger = new common_2.Logger('TypeOrmModule');
                        var synchronize = configService.get('DATABASE_SYNCHRONIZE', false);
                        if (synchronize) {
                            logger.warn('DATABASE_SYNCHRONIZE está habilitado. No usar en producción.');
                        }
                        return {
                            type: 'postgres',
                            host: configService.get('DATABASE_HOST', 'localhost'),
                            port: configService.get('DATABASE_PORT', 5432),
                            username: configService.get('DATABASE_USER', 'postgres'),
                            password: configService.get('DATABASE_PASSWORD', 'postgres'),
                            database: configService.get('DATABASE_NAME', 'tech_two_solution_db'),
                            autoLoadEntities: true,
                            synchronize: synchronize,
                            logging: configService.get('NODE_ENV') !== 'production',
                        };
                    },
                }),
                schedule_1.ScheduleModule.forRoot(), // 🚀 ¡REPARACIÓN! Inicializa el motor de Crons globalmente
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
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AppModule = _classThis = /** @class */ (function () {
        function AppModule_1() {
        }
        return AppModule_1;
    }());
    __setFunctionName(_classThis, "AppModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppModule = _classThis;
}();
exports.AppModule = AppModule;
