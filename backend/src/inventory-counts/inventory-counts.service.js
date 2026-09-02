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
exports.InventoryCountsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_count_entity_1 = require("./entities/inventory-count.entity");
const count_item_entity_1 = require("./entities/count-item.entity");
const product_entity_1 = require("../products/entities/product.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
let InventoryCountsService = class InventoryCountsService {
    inventoryCountRepository;
    countItemRepository;
    productRepository;
    auditLogRepository;
    constructor(inventoryCountRepository, countItemRepository, productRepository, auditLogRepository) {
        this.inventoryCountRepository = inventoryCountRepository;
        this.countItemRepository = countItemRepository;
        this.productRepository = productRepository;
        this.auditLogRepository = auditLogRepository;
    }
    async create(createInventoryCountDto, usuario) {
        try {
            const inventoryCount = this.inventoryCountRepository.create({
                almacen: createInventoryCountDto.almacen,
                descripcion: createInventoryCountDto.descripcion,
                estado: inventory_count_entity_1.ConteoEstado.EN_PROGRESO,
                items: [],
            });
            return await this.inventoryCountRepository.save(inventoryCount);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            throw new common_1.BadRequestException(`Error al crear conteo de inventario: ${message}`);
        }
    }
    async findAll(almacen) {
        try {
            const query = this.inventoryCountRepository.createQueryBuilder('ic');
            if (almacen) {
                query.where('ic.almacen = :almacen', { almacen });
            }
            return await query.orderBy('ic.createdAt', 'DESC').getMany();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            throw new common_1.BadRequestException(`Error al buscar conteos: ${message}`);
        }
    }
    async findOne(id) {
        try {
            const inventoryCount = await this.inventoryCountRepository.findOne({
                where: { id },
                relations: ['items'],
            });
            if (!inventoryCount) {
                throw new common_1.NotFoundException(`Conteo con id ${id} no encontrado`);
            }
            return inventoryCount;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            const message = error instanceof Error ? error.message : 'Error desconocido';
            throw new common_1.BadRequestException(`Error al buscar conteo: ${message}`);
        }
    }
    async addProductToCount(conteoId, addCountItemDto) {
        try {
            const inventoryCount = await this.findOne(conteoId);
            if (inventoryCount.estado !== inventory_count_entity_1.ConteoEstado.EN_PROGRESO) {
                throw new common_1.BadRequestException('Solo se pueden agregar productos a conteos en estado EN_PROGRESO');
            }
            const product = await this.productRepository.findOne({
                where: { id: addCountItemDto.productoId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Producto con id ${addCountItemDto.productoId} no encontrado`);
            }
            const existingItem = await this.countItemRepository.findOne({
                where: {
                    conteo: { id: conteoId },
                    productoId: addCountItemDto.productoId,
                },
            });
            if (existingItem) {
                throw new common_1.BadRequestException('Este producto ya está agregado al conteo');
            }
            const countItem = this.countItemRepository.create({
                conteo: inventoryCount,
                productoId: product.id,
                productoNombre: product.nombre,
                codigo: product.codigo,
                cantidadSistema: product.stock,
                cantidadContada: addCountItemDto.cantidadContada ?? undefined,
                precioUnitario: product.precio,
                unidadMedida: product.unidadMedida || 'Unidad',
            });
            const savedItem = await this.countItemRepository.save(countItem);
            inventoryCount.totalProductos = (inventoryCount.totalProductos || 0) + 1;
            await this.inventoryCountRepository.save(inventoryCount);
            return savedItem;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            const message = error instanceof Error ? error.message : 'Error desconocido';
            throw new common_1.BadRequestException(`Error al agregar producto al conteo: ${message}`);
        }
    }
    async updateCountItem(conteoId, itemId, updateCountItemDto) {
        try {
            const inventoryCount = await this.findOne(conteoId);
            if (inventoryCount.estado !== inventory_count_entity_1.ConteoEstado.EN_PROGRESO) {
                throw new common_1.BadRequestException('Solo se pueden actualizar items en conteos EN_PROGRESO');
            }
            const countItem = await this.countItemRepository.findOne({
                where: { id: itemId },
            });
            if (!countItem) {
                throw new common_1.NotFoundException(`Item con id ${itemId} no encontrado`);
            }
            countItem.cantidadContada = updateCountItemDto.cantidadContada;
            return await this.countItemRepository.save(countItem);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            const message = error instanceof Error ? error.message : 'Error desconocido';
            throw new common_1.BadRequestException(`Error al actualizar item del conteo: ${message}`);
        }
    }
    async publishAdjustments(conteoId) {
        try {
            const inventoryCount = await this.findOne(conteoId);
            if (inventoryCount.estado === inventory_count_entity_1.ConteoEstado.CANCELADO) {
                throw new common_1.BadRequestException('No se puede publicar un conteo cancelado');
            }
            inventoryCount.estado = inventory_count_entity_1.ConteoEstado.AJUSTES_PUBLICADOS;
            let totalVariacion = 0;
            for (const item of inventoryCount.items) {
                const diferencia = item.diferencia;
                if (diferencia !== 0) {
                    const product = await this.productRepository.findOne({
                        where: { id: item.productoId },
                    });
                    if (product) {
                        const nuevoStock = product.stock + diferencia;
                        product.stock = nuevoStock;
                        await this.productRepository.save(product);
                    }
                }
                totalVariacion += item.costoVariacion;
            }
            inventoryCount.totalVariacion = totalVariacion;
            return await this.inventoryCountRepository.save(inventoryCount);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            const message = error instanceof Error ? error.message : 'Error desconocido';
            throw new common_1.BadRequestException(`Error al publicar ajustes: ${message}`);
        }
    }
    async cancelCount(conteoId) {
        try {
            const inventoryCount = await this.findOne(conteoId);
            inventoryCount.estado = inventory_count_entity_1.ConteoEstado.CANCELADO;
            return await this.inventoryCountRepository.save(inventoryCount);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            const message = error instanceof Error ? error.message : 'Error desconocido';
            throw new common_1.BadRequestException(`Error al cancelar conteo: ${message}`);
        }
    }
    async remove(id, usuarioId) {
        try {
            const conteo = await this.findOne(id);
            await this.auditLogRepository.save({
                accion: 'ELIMINAR_CONTEO_FISICO',
                entidadId: id.toString(),
                entidadTipo: 'InventoryCount',
                usuarioId: usuarioId,
                detalles: {
                    almacen: conteo.almacen,
                    descripcion: conteo.descripcion,
                    fechaCreacion: conteo.createdAt,
                }
            });
            await this.inventoryCountRepository.delete(id);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.BadRequestException(`Error al eliminar conteo: ${error.message}`);
        }
    }
};
exports.InventoryCountsService = InventoryCountsService;
exports.InventoryCountsService = InventoryCountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_count_entity_1.InventoryCount)),
    __param(1, (0, typeorm_1.InjectRepository)(count_item_entity_1.CountItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InventoryCountsService);
//# sourceMappingURL=inventory-counts.service.js.map