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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const provider_entity_1 = require("../providers/entities/provider.entity");
const product_serial_entity_1 = require("./entities/product-serial.entity");
const movement_entity_1 = require("../movements/entities/movement.entity");
let ProductsService = class ProductsService {
    productRepository;
    providerRepository;
    dataSource;
    constructor(productRepository, providerRepository, dataSource) {
        this.productRepository = productRepository;
        this.providerRepository = providerRepository;
        this.dataSource = dataSource;
    }
    async create(createProductDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { serials, nota, ...productData } = createProductDto;
            if (productData.proveedorId) {
                const provider = await queryRunner.manager.findOneBy(provider_entity_1.Provider, { id: productData.proveedorId });
                if (!provider) {
                    throw new common_1.NotFoundException(`Proveedor con ID ${productData.proveedorId} no encontrado.`);
                }
            }
            const datosConAlmacen = {
                ...productData,
                isSerialized: productData.isSerialized || false,
                almacen: productData.almacen || 'Principal',
                nota: nota,
            };
            const nuevoProducto = queryRunner.manager.create(product_entity_1.Product, datosConAlmacen);
            if (nuevoProducto.isSerialized && serials && serials.length > 0) {
                const uniqueSerials = [...new Set(serials)];
                if (uniqueSerials.length !== serials.length) {
                    throw new common_1.BadRequestException('La lista contiene números de serie duplicados.');
                }
                const serialesExistentes = await queryRunner.manager
                    .getRepository(product_serial_entity_1.ProductSerial)
                    .createQueryBuilder('serial')
                    .where('serial.serialNumber IN (:...serials)', { serials: uniqueSerials })
                    .getMany();
                if (serialesExistentes.length > 0) {
                    throw new common_1.BadRequestException(`Los siguientes seriales ya existen: ${serialesExistentes.map(s => s.serialNumber).join(', ')}`);
                }
                nuevoProducto.seriales = uniqueSerials.map(serialNumber => {
                    const serialLimpio = serialNumber.trim();
                    return queryRunner.manager.create(product_serial_entity_1.ProductSerial, {
                        serialNumber: serialLimpio,
                        status: product_serial_entity_1.SerialStatus.DISPONIBLE,
                        almacen: nuevoProducto.almacen || 'Principal',
                    });
                });
                nuevoProducto.stock = nuevoProducto.seriales.length;
            }
            const productoGuardado = await queryRunner.manager.save(product_entity_1.Product, nuevoProducto);
            await queryRunner.commitTransaction();
            return productoGuardado;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(isActive = true) {
        if (isActive === 'all') {
            return await this.productRepository.find({
                relations: ['seriales', 'proveedor'],
                order: { createdAt: 'DESC' },
            });
        }
        return await this.productRepository.find({
            where: { isActive },
            relations: ['seriales', 'proveedor'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const producto = await this.productRepository.findOneBy({ id });
        if (!producto)
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado`);
        return producto;
    }
    async update(id, updateProductDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { serials, ...productData } = updateProductDto;
            const producto = await queryRunner.manager.findOne(product_entity_1.Product, {
                where: { id },
                relations: ['seriales'],
            });
            if (!producto) {
                throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado.`);
            }
            const almacenOriginal = producto.almacen;
            const almacenNuevo = productData.almacen;
            const cambioDeAlmacen = almacenNuevo && almacenOriginal !== almacenNuevo;
            queryRunner.manager.merge(product_entity_1.Product, producto, productData);
            if (!producto.isSerialized && cambioDeAlmacen && producto.stock > 0) {
            }
            if (producto.isSerialized) {
                const serialesActuales = producto.seriales || [];
                const serialesNuevos = serials ?? [];
                const serialesNuevosStr = [...new Set(serialesNuevos.map(s => String(s).trim()).filter(Boolean))];
                if (serials && serialesNuevosStr.length !== serials.length) {
                    throw new common_1.BadRequestException('La lista de seriales contiene duplicados.');
                }
                const serialesActualesStr = serialesActuales.map(s => s.serialNumber);
                const serialesAEliminar = serialesActuales.filter(s => !serialesNuevosStr.includes(s.serialNumber));
                for (const serial of serialesAEliminar) {
                    if (serial.status !== product_serial_entity_1.SerialStatus.DISPONIBLE) {
                        throw new common_1.BadRequestException(`No se puede eliminar el serial '${serial.serialNumber}' porque su estado es '${serial.status}'.`);
                    }
                }
                if (serialesAEliminar.length > 0) {
                    await queryRunner.manager.remove(serialesAEliminar);
                }
                const serialesACrear = serialesNuevosStr
                    .filter(s => !serialesActualesStr.includes(s))
                    .map(serialNumber => queryRunner.manager.create(product_serial_entity_1.ProductSerial, {
                    productoId: id,
                    serialNumber,
                    status: product_serial_entity_1.SerialStatus.DISPONIBLE,
                    almacen: productData.almacen ?? producto.almacen ?? 'Principal',
                }));
                if (serialesACrear.length > 0) {
                    const numerosDeSerialesACrear = serialesACrear.map(s => s.serialNumber);
                    const serialesExistentesEnDB = await queryRunner.manager
                        .getRepository(product_serial_entity_1.ProductSerial)
                        .createQueryBuilder('serial')
                        .where('serial.serialNumber IN (:...serials)', { serials: numerosDeSerialesACrear })
                        .getMany();
                    if (serialesExistentesEnDB.length > 0) {
                        throw new common_1.BadRequestException(`No se puede añadir, los seriales ya existen: ${serialesExistentesEnDB.map(s => s.serialNumber).join(', ')}`);
                    }
                }
                if (serialesACrear.length > 0) {
                    const nuevosSerialesGuardados = await queryRunner.manager.save(product_serial_entity_1.ProductSerial, serialesACrear);
                    producto.seriales = [...(producto.seriales || []), ...nuevosSerialesGuardados];
                }
                const serialesDisponiblesActuales = serialesActuales.filter(s => s.status === product_serial_entity_1.SerialStatus.DISPONIBLE).length;
                const serialesDisponiblesNuevos = serialesACrear.length;
                const serialesDisponiblesAEliminar = serialesAEliminar.filter(s => s.status === product_serial_entity_1.SerialStatus.DISPONIBLE).length;
                producto.stock = serialesDisponiblesActuales + serialesDisponiblesNuevos - serialesDisponiblesAEliminar;
            }
            if (!producto.isSerialized && cambioDeAlmacen && producto.stock > 0) {
                const stockATransferir = Number(producto.stock);
                await queryRunner.manager.query(`UPDATE product_warehouse_stock SET cantidad = cantidad - $1 WHERE "productoId" = $2 AND almacen = $3`, [stockATransferir, id, almacenOriginal]);
                await queryRunner.manager.query(`INSERT INTO product_warehouse_stock ("productoId", almacen, cantidad) VALUES ($1, $2, $3)
           ON CONFLICT ("productoId", almacen) DO UPDATE SET cantidad = product_warehouse_stock.cantidad + $3`, [id, almacenNuevo, stockATransferir]);
                const movementLog = queryRunner.manager.create(movement_entity_1.Movement, {
                    productoId: id,
                    tipo: 'TRANSFERENCIA',
                    cantidad: stockATransferir,
                    nota: `Cambio de almacén principal de ${almacenOriginal} a ${almacenNuevo}`,
                    almacenOrigen: almacenOriginal,
                    almacenDestino: almacenNuevo,
                });
                await queryRunner.manager.save(movementLog);
            }
            const productoActualizado = await queryRunner.manager.save(product_entity_1.Product, producto);
            await queryRunner.commitTransaction();
            return productoActualizado;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async remove(id) {
        const producto = await this.findOne(id);
        if (!producto.isActive) {
            throw new common_1.BadRequestException(`El producto con ID ${id} ya se encuentra inactivo.`);
        }
        await this.productRepository.update(id, { isActive: false });
        return { ...producto, isActive: false };
    }
    async restore(id) {
        const producto = await this.findOne(id);
        if (producto.isActive) {
            throw new common_1.BadRequestException(`El producto con ID ${id} ya está activo.`);
        }
        producto.isActive = true;
        return await this.productRepository.save(producto);
    }
    async getInventorySummary() {
        const totalValueResult = await this.productRepository
            .createQueryBuilder('product')
            .select('SUM(product.stock * product.precio)', 'totalValue')
            .where('product.isActive = :isActive', { isActive: true })
            .getRawOne();
        const totalValue = parseFloat(totalValueResult.totalValue) || 0;
        const productsPerCategory = await this.productRepository
            .createQueryBuilder('product')
            .select('product.categoria', 'category')
            .addSelect('COUNT(product.id)', 'count')
            .where('product.isActive = :isActive', { isActive: true })
            .groupBy('product.categoria')
            .orderBy('count', 'DESC')
            .getRawMany();
        const totalsResult = await this.productRepository
            .createQueryBuilder('product')
            .select('COUNT(product.id)', 'totalProducts')
            .addSelect('SUM(product.stock)', 'totalStock')
            .where('product.isActive = :isActive', { isActive: true })
            .getRawOne();
        return {
            totalValue,
            productsPerCategory,
            totalProducts: parseInt(totalsResult.totalProducts, 10) || 0,
            totalStock: parseInt(totalsResult.totalStock, 10) || 0,
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(provider_entity_1.Provider)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ProductsService);
//# sourceMappingURL=products.service.js.map