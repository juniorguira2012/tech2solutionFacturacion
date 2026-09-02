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
exports.InventoryBatchesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_batch_entity_1 = require("./entities/inventory-batch.entity");
const product_entity_1 = require("../products/entities/product.entity");
let InventoryBatchesService = class InventoryBatchesService {
    inventoryBatchRepository;
    productRepository;
    constructor(inventoryBatchRepository, productRepository) {
        this.inventoryBatchRepository = inventoryBatchRepository;
        this.productRepository = productRepository;
    }
    async findAllBatches() {
        return this.inventoryBatchRepository.find({
            relations: ['producto'],
            order: { createdAt: 'DESC' },
        });
    }
    async createBatch(createDto) {
        const { productoId, ...datosLote } = createDto;
        const producto = await this.productRepository.findOneBy({ id: productoId });
        if (!producto) {
            throw new common_1.NotFoundException(`Producto con ID ${productoId} no encontrado.`);
        }
        const nuevoLote = this.inventoryBatchRepository.create({
            ...datosLote,
            producto: producto,
        });
        return this.inventoryBatchRepository.save(nuevoLote);
    }
    async updateBatch(id, updateDto) {
        const { productoId, ...datosActualizar } = updateDto;
        const lote = await this.inventoryBatchRepository.preload({
            id: id,
            ...datosActualizar,
        });
        if (!lote) {
            throw new common_1.NotFoundException(`Lote con ID ${id} no encontrado.`);
        }
        if (productoId) {
            const producto = await this.productRepository.findOneBy({ id: productoId });
            if (!producto) {
                throw new common_1.NotFoundException(`Producto con ID ${productoId} no encontrado.`);
            }
            lote.producto = producto;
        }
        return this.inventoryBatchRepository.save(lote);
    }
    async removeBatch(id) {
        const lote = await this.inventoryBatchRepository.findOneBy({ id });
        if (!lote) {
            throw new common_1.NotFoundException(`Lote con ID ${id} no encontrado.`);
        }
        await this.inventoryBatchRepository.remove(lote);
        return { message: `Lote con ID ${id} eliminado con éxito.` };
    }
};
exports.InventoryBatchesService = InventoryBatchesService;
exports.InventoryBatchesService = InventoryBatchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_batch_entity_1.InventoryBatch)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], InventoryBatchesService);
//# sourceMappingURL=inventory-batches.service.js.map