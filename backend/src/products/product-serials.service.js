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
exports.ProductSerialsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_serial_entity_1 = require("./entities/product-serial.entity");
const product_entity_1 = require("./entities/product.entity");
let ProductSerialsService = class ProductSerialsService {
    serialRepository;
    productRepository;
    dataSource;
    constructor(serialRepository, productRepository, dataSource) {
        this.serialRepository = serialRepository;
        this.productRepository = productRepository;
        this.dataSource = dataSource;
    }
    async findAll(page = 1, limit = 50) {
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));
        const [data, total] = await this.serialRepository.findAndCount({
            relations: ['producto'],
            order: { createdAt: 'DESC' },
            take: limitNum,
            skip: (pageNum - 1) * limitNum,
        });
        return {
            data,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        };
    }
    async findByProductId(productId, page = 1, limit = 50) {
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));
        const [data, total] = await this.serialRepository.findAndCount({
            where: { productoId: productId },
            relations: ['producto'],
            order: { createdAt: 'DESC' },
            take: limitNum,
            skip: (pageNum - 1) * limitNum,
        });
        return {
            data,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        };
    }
    async findOne(id) {
        const serial = await this.serialRepository.findOne({
            where: { id },
            relations: ['producto'],
        });
        if (!serial) {
            throw new common_1.NotFoundException(`Serial con ID ${id} no encontrado.`);
        }
        return serial;
    }
    async updateSerialNumber(id, updateDto) {
        const newSerialNumber = updateDto.serialNumber?.trim();
        if (!newSerialNumber) {
            throw new common_1.BadRequestException('El número de serie no puede estar vacío.');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const serial = await queryRunner.manager.findOne(product_serial_entity_1.ProductSerial, { where: { id } });
            if (!serial) {
                throw new common_1.NotFoundException(`Serial con ID ${id} no encontrado.`);
            }
            if (serial.status !== product_serial_entity_1.SerialStatus.DISPONIBLE) {
                throw new common_1.BadRequestException(`No se puede modificar el serial. Su estado es '${serial.status}'.`);
            }
            const existingSerial = await queryRunner.manager.findOne(product_serial_entity_1.ProductSerial, {
                where: { serialNumber: newSerialNumber, productoId: serial.productoId },
            });
            if (existingSerial && existingSerial.id !== id) {
                throw new common_1.BadRequestException(`El serial '${newSerialNumber}' ya existe para este producto.`);
            }
            serial.serialNumber = newSerialNumber;
            const updatedSerial = await queryRunner.manager.save(product_serial_entity_1.ProductSerial, serial);
            await queryRunner.commitTransaction();
            return updatedSerial;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateStatus(id, status) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const serial = await queryRunner.manager.findOne(product_serial_entity_1.ProductSerial, {
                where: { id },
                relations: ['producto'],
            });
            if (!serial) {
                throw new common_1.NotFoundException(`Serial con ID ${id} no encontrado.`);
            }
            serial.status = status;
            const serialActualizado = await queryRunner.manager.save(product_serial_entity_1.ProductSerial, serial);
            const nuevoStockDisponible = await queryRunner.manager.count(product_serial_entity_1.ProductSerial, {
                where: { productoId: serial.productoId, status: product_serial_entity_1.SerialStatus.DISPONIBLE },
            });
            await queryRunner.manager.update(product_entity_1.Product, serial.productoId, { stock: nuevoStockDisponible });
            await queryRunner.commitTransaction();
            return serialActualizado;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.ProductSerialsService = ProductSerialsService;
exports.ProductSerialsService = ProductSerialsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_serial_entity_1.ProductSerial)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ProductSerialsService);
//# sourceMappingURL=product-serials.service.js.map