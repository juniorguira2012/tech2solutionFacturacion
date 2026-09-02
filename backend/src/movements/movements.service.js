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
exports.MovementsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const movement_entity_1 = require("./entities/movement.entity");
const product_entity_1 = require("../products/entities/product.entity");
const product_warehouse_stock_entity_1 = require("../products/entities/product-warehouse-stock.entity");
const product_serial_entity_1 = require("../products/entities/product-serial.entity");
const inventory_batch_entity_1 = require("./entities/inventory-batch.entity");
const technician_entity_1 = require("./entities/technician.entity");
let MovementsService = class MovementsService {
    movementRepository;
    productRepository;
    technicianRepository;
    inventoryBatchRepository;
    dataSource;
    constructor(movementRepository, productRepository, technicianRepository, inventoryBatchRepository, dataSource) {
        this.movementRepository = movementRepository;
        this.productRepository = productRepository;
        this.technicianRepository = technicianRepository;
        this.inventoryBatchRepository = inventoryBatchRepository;
        this.dataSource = dataSource;
    }
    async findTechnicians() {
        return this.technicianRepository.find({
            where: { isActive: true },
            order: { nombre: 'ASC' },
        });
    }
    async createTechnician(payload) {
        const nombre = payload.nombre?.trim();
        if (!nombre) {
            throw new common_1.BadRequestException('El nombre del técnico es obligatorio');
        }
        const existente = await this.technicianRepository.findOne({ where: { nombre } });
        if (existente) {
            if (!existente.isActive) {
                existente.isActive = true;
                existente.telefono = payload.telefono?.trim() || existente.telefono;
                existente.email = payload.email?.trim() || existente.email;
                return this.technicianRepository.save(existente);
            }
            return existente;
        }
        const technician = this.technicianRepository.create({
            nombre,
            telefono: payload.telefono?.trim() || undefined,
            email: payload.email?.trim() || undefined,
        });
        return this.technicianRepository.save(technician);
    }
    async updateTechnician(id, payload) {
        const technician = await this.technicianRepository.findOne({ where: { id } });
        if (!technician) {
            throw new common_1.NotFoundException(`Técnico ID ${id} no encontrado`);
        }
        const nombre = payload.nombre?.trim();
        if (nombre) {
            const duplicado = await this.technicianRepository.findOne({
                where: { nombre, id: (0, typeorm_2.Not)(id) },
            });
            if (duplicado) {
                throw new common_1.BadRequestException('Ya existe otro técnico con ese nombre');
            }
            technician.nombre = nombre;
        }
        if (payload.telefono !== undefined)
            technician.telefono = payload.telefono?.trim() || undefined;
        if (payload.email !== undefined)
            technician.email = payload.email?.trim() || undefined;
        if (payload.isActive !== undefined)
            technician.isActive = Boolean(payload.isActive);
        return this.technicianRepository.save(technician);
    }
    async deleteTechnician(id) {
        const technician = await this.technicianRepository.findOne({ where: { id } });
        if (!technician) {
            throw new common_1.NotFoundException(`Técnico ID ${id} no encontrado`);
        }
        technician.isActive = false;
        return this.technicianRepository.save(technician);
    }
    async resolveTechnician(manager, technicianId, technicianName) {
        if (technicianId) {
            const technician = await manager.findOne(technician_entity_1.Technician, { where: { id: Number(technicianId) } });
            if (!technician)
                throw new common_1.NotFoundException(`Técnico ID ${technicianId} no encontrado`);
            return technician;
        }
        const nombre = technicianName?.trim();
        if (!nombre)
            return null;
        const existente = await manager.findOne(technician_entity_1.Technician, { where: { nombre } });
        if (existente)
            return existente;
        const nuevo = manager.create(technician_entity_1.Technician, { nombre });
        return manager.save(technician_entity_1.Technician, nuevo);
    }
    async updateWarehouseStock(manager, productoId, almacen, cantidad, isAbsolute = false) {
        if (!almacen)
            return;
        const nombreAlmacen = almacen.trim();
        const idProducto = Number(productoId);
        const cantidadNueva = Number(cantidad);
        const existeStock = await manager.findOne(product_warehouse_stock_entity_1.ProductWarehouseStock, {
            where: { productoId: idProducto, almacen: nombreAlmacen },
        });
        if (!existeStock) {
            const stockInicial = isAbsolute ? cantidadNueva : (cantidadNueva < 0 ? 0 : cantidadNueva);
            const nuevoStockEntry = manager.create(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                productoId: idProducto,
                almacen: nombreAlmacen,
                cantidad: stockInicial,
            });
            await manager.save(product_warehouse_stock_entity_1.ProductWarehouseStock, nuevoStockEntry);
        }
        else {
            const nuevaCantidadCalculada = isAbsolute
                ? cantidadNueva
                : Number(existeStock.cantidad) + cantidadNueva;
            await manager.update(product_warehouse_stock_entity_1.ProductWarehouseStock, { productoId: idProducto, almacen: nombreAlmacen }, { cantidad: nuevaCantidadCalculada });
        }
    }
    async generateAndSaveBatch(manager, productoId, cantidad, almacen, providedBatchNumber) {
        const batchNumber = providedBatchNumber || `LOTE-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        const batchEntry = manager.create(inventory_batch_entity_1.InventoryBatch, {
            productoId: productoId,
            numeroLote: batchNumber,
            cantidad: cantidad,
            almacen: almacen,
            fechaVencimiento: expiryDate,
        });
        await manager.save(inventory_batch_entity_1.InventoryBatch, batchEntry);
        return batchNumber;
    }
    async ensureDetailedStockInitialized(manager, producto) {
        const count = await manager.count(product_warehouse_stock_entity_1.ProductWarehouseStock, {
            where: { productoId: producto.id },
        });
        if (count === 0 && Number(producto.stock) > 0 && producto.almacen) {
            const entry = manager.create(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                productoId: producto.id,
                almacen: producto.almacen,
                cantidad: producto.stock,
            });
            await manager.save(product_warehouse_stock_entity_1.ProductWarehouseStock, entry);
        }
    }
    async transferBulk(transferData) {
        const { productoId, almacenOrigen, almacenDestino, cantidad, nota, usuarioId } = transferData;
        if (almacenOrigen === almacenDestino) {
            throw new common_1.BadRequestException('El almacén de origen y destino no pueden ser iguales.');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const producto = await queryRunner.manager.findOne(product_entity_1.Product, { where: { id: productoId } });
            if (!producto) {
                throw new common_1.NotFoundException(`Producto ID ${productoId} no encontrado`);
            }
            await this.ensureDetailedStockInitialized(queryRunner.manager, producto);
            const cantidadNumerica = Number(cantidad);
            const stockOrigen = await queryRunner.manager.findOne(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                where: { productoId: producto.id, almacen: almacenOrigen.trim() }
            });
            const stockDisponibleOrigen = stockOrigen ? Number(stockOrigen.cantidad) : 0;
            if (stockDisponibleOrigen < cantidadNumerica) {
                throw new common_1.BadRequestException(`Stock insuficiente en ${almacenOrigen} para ${producto.nombre}. Disponible: ${stockDisponibleOrigen}, Requerido: ${cantidadNumerica}`);
            }
            await this.updateWarehouseStock(queryRunner.manager, productoId, almacenOrigen, -cantidadNumerica);
            await this.updateWarehouseStock(queryRunner.manager, productoId, almacenDestino, cantidadNumerica);
            const logSalida = queryRunner.manager.create(movement_entity_1.Movement, {
                producto: producto,
                productoId: producto.id,
                tipo: 'SALIDA',
                cantidad: cantidadNumerica,
                nuevoStock: Number(producto.stock),
                nota: `TRANSFERENCIA (ORIGEN: ${almacenOrigen} -> DESTINO: ${almacenDestino}) | ${nota}`,
                almacenOrigen: almacenOrigen,
                almacenDestino: almacenDestino,
                usuarioId: usuarioId ? String(usuarioId) : undefined
            });
            await queryRunner.manager.save(movement_entity_1.Movement, logSalida);
            const logEntrada = queryRunner.manager.create(movement_entity_1.Movement, {
                producto: producto,
                productoId: producto.id,
                tipo: 'ENTRADA',
                cantidad: cantidadNumerica,
                nuevoStock: Number(producto.stock),
                nota: `TRANSFERENCIA (RECIBIDO DESDE: ${almacenOrigen}) | ${nota}`,
                almacenOrigen: almacenOrigen,
                almacenDestino: almacenDestino,
                usuarioId: usuarioId ? String(usuarioId) : undefined
            });
            await queryRunner.manager.save(movement_entity_1.Movement, logEntrada);
            await queryRunner.commitTransaction();
            return { message: 'Transferencia procesada con éxito', productoId, cantidad: cantidadNumerica };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async create(createMovementDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { productoId, tipo, cantidad, nota, usuarioId, almacenOrigen, almacenDestino, referencia, lote, technicianId, technicianName, } = createMovementDto;
        try {
            let batchGenerated = '';
            const producto = await queryRunner.manager.findOne(product_entity_1.Product, { where: { id: Number(productoId) } });
            if (!producto) {
                throw new common_1.NotFoundException(`Producto con ID ${productoId} no encontrado`);
            }
            await this.ensureDetailedStockInitialized(queryRunner.manager, producto);
            const tipoNormalizado = tipo.toUpperCase();
            const cantidadNumerica = Number(cantidad);
            let nuevoStock = Number(producto.stock);
            const technician = await this.resolveTechnician(queryRunner.manager, technicianId, technicianName);
            const targetAlmacen = (almacenDestino || almacenOrigen || producto.almacen || 'Principal').trim();
            if (tipoNormalizado === 'TRANSFERIR') {
                if (!almacenOrigen || !almacenDestino) {
                    throw new common_1.BadRequestException('Para una transferencia se requiere un almacén de origen y uno de destino.');
                }
                const stockOrigen = await queryRunner.manager.findOne(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                    where: { productoId: producto.id, almacen: almacenOrigen.trim() }
                });
                const disponibleOrigen = stockOrigen ? Number(stockOrigen.cantidad) : 0;
                if (disponibleOrigen < cantidadNumerica) {
                    throw new common_1.BadRequestException(`Stock insuficiente en almacén de origen '${almacenOrigen}'. Disponible: ${disponibleOrigen}, Requerido: ${cantidadNumerica}`);
                }
                await this.updateWarehouseStock(queryRunner.manager, producto.id, almacenOrigen, -cantidadNumerica);
                await this.updateWarehouseStock(queryRunner.manager, producto.id, almacenDestino, cantidadNumerica);
            }
            else {
                const tiposIncremento = ['ENTRADA', 'RECIBIR', 'DEVOLUCION_FACTURA'];
                const tiposDecremento = ['SALIDA', 'DESPACHAR', 'DESCARTAR', 'DEVOLUCION'];
                if (tiposIncremento.includes(tipoNormalizado)) {
                    nuevoStock += cantidadNumerica;
                    await this.updateWarehouseStock(queryRunner.manager, producto.id, targetAlmacen, cantidadNumerica);
                    batchGenerated = await this.generateAndSaveBatch(queryRunner.manager, producto.id, cantidadNumerica, targetAlmacen, lote);
                }
                else if (tiposDecremento.includes(tipoNormalizado)) {
                    const stockEnAlmacen = await queryRunner.manager.findOne(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                        where: { productoId: producto.id, almacen: targetAlmacen }
                    });
                    const cantidadDisponibleAlmacen = stockEnAlmacen ? Number(stockEnAlmacen.cantidad) : 0;
                    if (cantidadDisponibleAlmacen < cantidadNumerica) {
                        throw new common_1.BadRequestException(`Stock insuficiente en el almacén '${targetAlmacen}' para ${producto.nombre}. Disponible: ${cantidadDisponibleAlmacen}, Solicitado: ${cantidadNumerica}`);
                    }
                    nuevoStock -= cantidadNumerica;
                    await this.updateWarehouseStock(queryRunner.manager, producto.id, targetAlmacen, -cantidadNumerica);
                }
                else if (tipoNormalizado === 'AJUSTE' || tipoNormalizado === 'AJUSTAR') {
                    if (cantidadNumerica < 0)
                        throw new common_1.BadRequestException('El stock no puede ser negativo tras un ajuste');
                    await this.updateWarehouseStock(queryRunner.manager, producto.id, targetAlmacen, cantidadNumerica, true);
                    const allStocks = await queryRunner.manager.find(product_warehouse_stock_entity_1.ProductWarehouseStock, { where: { productoId: producto.id } });
                    nuevoStock = allStocks.reduce((sum, s) => sum + Number(s.cantidad), 0);
                    if (createMovementDto.costoUnitario !== undefined && createMovementDto.costoUnitario !== null) {
                        producto.precio = Number(createMovementDto.costoUnitario);
                    }
                }
                else {
                    throw new common_1.BadRequestException(`Tipo de movimiento no válido: ${tipo}`);
                }
                producto.stock = nuevoStock;
            }
            await queryRunner.manager.update(product_entity_1.Product, producto.id, {
                stock: nuevoStock,
                precio: producto.precio
            });
            const movement = queryRunner.manager.create(movement_entity_1.Movement, {
                producto: producto,
                productoId: producto.id,
                tipo: tipoNormalizado,
                cantidad: cantidadNumerica,
                nuevoStock: Number(nuevoStock),
                nota: batchGenerated ? `${nota || ''} | Lote: ${batchGenerated}` : nota,
                technician: technician || undefined,
                technicianId: technician?.id,
                usuarioId: usuarioId ? String(usuarioId) : undefined,
                almacenOrigen: almacenOrigen || targetAlmacen,
                almacenDestino: almacenDestino || targetAlmacen,
                costoUnitario: createMovementDto.costoUnitario ? Number(createMovementDto.costoUnitario) : undefined,
                referencia: referencia || undefined,
            });
            const savedMovement = await queryRunner.manager.save(movement_entity_1.Movement, movement);
            if (technician)
                savedMovement.technician = technician;
            await queryRunner.commitTransaction();
            return savedMovement;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async createBulk(bulkData) {
        const { tipo, nota, items, usuarioId, referencia } = bulkData;
        if (!Array.isArray(items) || items.length === 0) {
            throw new common_1.BadRequestException('Debe incluir al menos una línea de mercancía');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const movimientosCreados = [];
            const tipoNormalizado = tipo ? tipo.trim().toUpperCase() : 'RECIBIR';
            const finalUsuarioId = (usuarioId && !isNaN(Number(usuarioId))) ? String(usuarioId) : undefined;
            const tiposIncremento = ['ENTRADA', 'RECIBIR', 'DEVOLUCION_FACTURA'];
            const tiposDecremento = ['SALIDA', 'DESPACHAR', 'DESCARTAR', 'DEVOLUCION'];
            if (!tiposIncremento.includes(tipoNormalizado) && !tiposDecremento.includes(tipoNormalizado)) {
                throw new common_1.BadRequestException(`Tipo de movimiento masivo no válido: ${tipo}`);
            }
            for (const [index, item] of items.entries()) {
                const { productoId, cantidad, almacen, lote, serials } = item;
                const idNum = Number(productoId);
                const numeroLinea = index + 1;
                if (!productoId || isNaN(idNum)) {
                    throw new common_1.BadRequestException(`Línea ${numeroLinea}: producto inválido`);
                }
                const almacenNormalizado = String(almacen || 'Principal').trim() || 'Principal';
                const producto = await queryRunner.manager.findOne(product_entity_1.Product, { where: { id: idNum } });
                if (!producto) {
                    throw new common_1.NotFoundException(`Producto ID ${productoId} no encontrado en la base de datos`);
                }
                await this.ensureDetailedStockInitialized(queryRunner.manager, producto);
                let nuevoStock = Number(producto.stock);
                let batchInfo = '';
                if (producto.isSerialized) {
                    if (!Array.isArray(serials) || serials.length === 0) {
                        throw new common_1.BadRequestException(`Línea ${numeroLinea} (${producto.nombre}): Debe proporcionar una lista de seriales para este producto.`);
                    }
                    const totalSeriales = serials.length;
                    if (tiposIncremento.includes(tipoNormalizado)) {
                        for (const serialNumber of serials) {
                            const serialLimpio = serialNumber.trim();
                            if (!serialLimpio)
                                continue;
                            const serialExistente = await queryRunner.manager.findOne(product_serial_entity_1.ProductSerial, {
                                where: {
                                    productoId: producto.id,
                                    serialNumber: serialLimpio,
                                },
                            });
                            if (serialExistente) {
                                throw new common_1.BadRequestException(`El serial "${serialLimpio}" ya ha sido registrado para el producto "${producto.nombre}".`);
                            }
                            const nuevoSerial = queryRunner.manager.create(product_serial_entity_1.ProductSerial, {
                                productoId: producto.id,
                                serialNumber: serialLimpio,
                                almacen: almacenNormalizado,
                                status: product_serial_entity_1.SerialStatus.DISPONIBLE,
                            });
                            await queryRunner.manager.save(product_serial_entity_1.ProductSerial, nuevoSerial);
                        }
                        await this.updateWarehouseStock(queryRunner.manager, producto.id, almacenNormalizado, totalSeriales);
                        nuevoStock = await queryRunner.manager.count(product_serial_entity_1.ProductSerial, { where: { productoId: producto.id, status: product_serial_entity_1.SerialStatus.DISPONIBLE } });
                    }
                    else {
                        for (const serialNumber of serials) {
                            const serialADespachar = await queryRunner.manager.findOne(product_serial_entity_1.ProductSerial, {
                                where: { productoId: producto.id, serialNumber: serialNumber.trim(), status: product_serial_entity_1.SerialStatus.DISPONIBLE }
                            });
                            if (!serialADespachar) {
                                throw new common_1.BadRequestException(`Serial "${serialNumber}" no encontrado o no disponible en el inventario.`);
                            }
                            serialADespachar.status = product_serial_entity_1.SerialStatus.VENDIDO;
                            await queryRunner.manager.save(product_serial_entity_1.ProductSerial, serialADespachar);
                        }
                        await this.updateWarehouseStock(queryRunner.manager, producto.id, almacenNormalizado, -totalSeriales);
                        nuevoStock = await queryRunner.manager.count(product_serial_entity_1.ProductSerial, { where: { productoId: producto.id, status: product_serial_entity_1.SerialStatus.DISPONIBLE } });
                    }
                }
                else {
                    const cantidadNumerica = Number(cantidad);
                    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
                        throw new common_1.BadRequestException(`Línea ${numeroLinea}: la cantidad debe ser mayor a 0`);
                    }
                    if (tiposIncremento.includes(tipoNormalizado)) {
                        nuevoStock += cantidadNumerica;
                        await this.updateWarehouseStock(queryRunner.manager, producto.id, almacenNormalizado, cantidadNumerica);
                        batchInfo = await this.generateAndSaveBatch(queryRunner.manager, idNum, cantidadNumerica, almacenNormalizado, lote);
                    }
                    else if (tiposDecremento.includes(tipoNormalizado)) {
                        const stockEnAlmacen = await queryRunner.manager.findOne(product_warehouse_stock_entity_1.ProductWarehouseStock, {
                            where: { productoId: producto.id, almacen: almacenNormalizado }
                        });
                        const cantidadDisponibleAlmacen = stockEnAlmacen ? Number(stockEnAlmacen.cantidad) : 0;
                        if (cantidadDisponibleAlmacen < cantidadNumerica) {
                            throw new common_1.BadRequestException(`Stock insuficiente en el almacén '${almacenNormalizado}' para ${producto.nombre}. Disponible: ${cantidadDisponibleAlmacen}, Solicitado: ${cantidadNumerica}`);
                        }
                        nuevoStock -= cantidadNumerica;
                        await this.updateWarehouseStock(queryRunner.manager, producto.id, almacenNormalizado, -cantidadNumerica);
                    }
                }
                await queryRunner.manager.update(product_entity_1.Product, producto.id, { stock: nuevoStock });
                producto.stock = nuevoStock;
                const cantidadMovimiento = producto.isSerialized ? (serials?.length || 0) : Number(cantidad);
                const nuevoMovimiento = queryRunner.manager.create(movement_entity_1.Movement, {
                    producto: producto,
                    productoId: producto.id,
                    tipo: tipoNormalizado,
                    cantidad: cantidadMovimiento,
                    nuevoStock: Number(producto.stock),
                    nota: `${nota || ''}${batchInfo ? ` | Lote: ${batchInfo}` : ''} | Almacén: ${almacenNormalizado}`,
                    costoUnitario: producto.precio ? Number(producto.precio) : undefined,
                    almacenOrigen: almacenNormalizado,
                    almacenDestino: almacenNormalizado,
                    referencia: referencia ? String(referencia) : undefined,
                    usuarioId: finalUsuarioId,
                });
                const guardado = await queryRunner.manager.save(movement_entity_1.Movement, nuevoMovimiento);
                movimientosCreados.push(guardado);
            }
            if (movimientosCreados.length === 0) {
                throw new common_1.BadRequestException('No se procesó ninguna línea de mercancía');
            }
            await queryRunner.commitTransaction();
            return { success: true, count: movimientosCreados.length, data: movimientosCreados };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            console.error("Error crítico en Bulk Movement:", err);
            throw new common_1.BadRequestException(`No se pudo procesar el movimiento: ${err.message}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async assignSerialsToTechnician(dto) {
        const { technicianId, serials, usuarioId } = dto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const technician = await queryRunner.manager.findOne(technician_entity_1.Technician, { where: { id: technicianId } });
            if (!technician) {
                throw new common_1.NotFoundException(`Técnico con ID ${technicianId} no encontrado.`);
            }
            const uniqueSerials = [...new Set(serials.map(s => s.trim()).filter(Boolean))];
            if (uniqueSerials.length === 0) {
                throw new common_1.BadRequestException('Debe proporcionar al menos un número de serie válido.');
            }
            const productSerials = await queryRunner.manager.find(product_serial_entity_1.ProductSerial, {
                where: { serialNumber: (0, typeorm_2.In)(uniqueSerials) },
                relations: ['producto'],
            });
            if (productSerials.length !== uniqueSerials.length) {
                const foundSerials = productSerials.map(ps => ps.serialNumber);
                const notFound = uniqueSerials.filter(s => !foundSerials.includes(s));
                throw new common_1.NotFoundException(`Los siguientes seriales no se encontraron: ${notFound.join(', ')}`);
            }
            const movementsToCreate = [];
            const productsToUpdate = new Map();
            for (const serial of productSerials) {
                if (serial.status !== product_serial_entity_1.SerialStatus.DISPONIBLE) {
                    throw new common_1.BadRequestException(`El serial ${serial.serialNumber} no está disponible (estado actual: ${serial.status}).`);
                }
                serial.status = product_serial_entity_1.SerialStatus.ASIGNADO_TECNICO;
                movementsToCreate.push({
                    productoId: serial.productoId,
                    tipo: 'ASIGNACION_TECNICO',
                    cantidad: 1,
                    nota: `Asignado al técnico: ${technician.nombre} | Serial: ${serial.serialNumber}`,
                    serials: [serial.serialNumber],
                    technicianId: technician.id,
                    usuarioId: usuarioId ? String(usuarioId) : undefined,
                    almacenOrigen: serial.almacen,
                    almacenDestino: 'Móvil (Técnico)',
                });
            }
            await queryRunner.manager.save(product_serial_entity_1.ProductSerial, productSerials);
            const uniqueProductIds = [...new Set(productSerials.map(s => s.productoId))];
            for (const productId of uniqueProductIds) {
                const stockDisponible = await queryRunner.manager.count(product_serial_entity_1.ProductSerial, {
                    where: { productoId: productId, status: product_serial_entity_1.SerialStatus.DISPONIBLE },
                });
                await queryRunner.manager.update(product_entity_1.Product, productId, { stock: stockDisponible });
            }
            for (const [productId, newStock] of productsToUpdate.entries()) {
                await queryRunner.manager.update(product_entity_1.Product, productId, { stock: newStock });
            }
            await queryRunner.manager.save(movement_entity_1.Movement, movementsToCreate);
            await queryRunner.commitTransaction();
            return { message: `${uniqueSerials.length} serial(es) asignado(s) a ${technician.nombre} con éxito.` };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async returnSerialFromTechnician(dto, usuarioId) {
        const serialRaw = dto.serialNumber || dto.serial;
        const nota = dto.nota;
        if (!serialRaw) {
            throw new common_1.BadRequestException('El número de serie es requerido para procesar la devolución.');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const serial = await queryRunner.manager.findOne(product_serial_entity_1.ProductSerial, {
                where: { serialNumber: serialRaw.trim() },
                relations: ['producto'],
            });
            if (!serial) {
                throw new common_1.NotFoundException(`El serial '${serialRaw}' no fue encontrado en el sistema.`);
            }
            if (serial.status !== product_serial_entity_1.SerialStatus.ASIGNADO_TECNICO) {
                throw new common_1.BadRequestException(`El serial '${serialRaw}' no está asignado a un técnico (Estado actual: ${serial.status}).`);
            }
            serial.status = product_serial_entity_1.SerialStatus.DISPONIBLE;
            serial.lastReturnNote = nota ?? serial.lastReturnNote;
            await queryRunner.manager.save(product_serial_entity_1.ProductSerial, serial);
            const producto = serial.producto;
            if (producto) {
                const nuevoStock = await queryRunner.manager.count(product_serial_entity_1.ProductSerial, {
                    where: { productoId: producto.id, status: product_serial_entity_1.SerialStatus.DISPONIBLE },
                });
                await queryRunner.manager.update(product_entity_1.Product, producto.id, { stock: nuevoStock });
                const movement = queryRunner.manager.create(movement_entity_1.Movement, {
                    productoId: producto.id,
                    tipo: 'DEVOLUCION_TECNICO',
                    cantidad: 1,
                    nuevoStock: nuevoStock,
                    nota: `Devolución de técnico. ${nota || ''}`.trim(),
                    serials: [serial.serialNumber],
                    usuarioId: usuarioId,
                    almacenOrigen: 'Móvil (Técnico)',
                    almacenDestino: serial.almacen || 'Principal',
                });
                await queryRunner.manager.save(movement_entity_1.Movement, movement);
            }
            await queryRunner.commitTransaction();
            return { message: `Serial '${serialRaw}' devuelto al inventario con éxito.` };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(usuarioId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const queryBuilder = this.movementRepository.createQueryBuilder('movement')
            .leftJoinAndSelect('movement.producto', 'producto')
            .leftJoinAndSelect('movement.technician', 'technician')
            .leftJoinAndSelect('movement.usuario', 'usuario')
            .orderBy('movement.createdAt', 'DESC')
            .take(limit)
            .skip(skip);
        if (usuarioId) {
            queryBuilder.where('movement.usuarioId = :usuarioId', { usuarioId });
        }
        const [data, total] = await queryBuilder.getManyAndCount();
        return {
            data,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }
    async findByProductId(productoId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.movementRepository.findAndCount({
            where: { productoId },
            relations: ['producto', 'technician', 'usuario'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: skip,
        });
        return {
            data,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }
    async findBySerialNumber(serialNumber) {
        return this.movementRepository
            .createQueryBuilder('movement')
            .leftJoinAndSelect('movement.producto', 'producto')
            .leftJoinAndSelect('movement.usuario', 'usuario')
            .where(`movement.serials @> :serial`, { serial: `["${serialNumber}"]` })
            .orderBy('movement.createdAt', 'DESC')
            .getMany();
    }
    async findAllBatches() {
        return this.inventoryBatchRepository.find({
            relations: ['producto'],
            order: { createdAt: 'DESC' },
        });
    }
    async createBatch(createDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { productoId, cantidad, almacen, numeroLote } = createDto;
            const producto = await queryRunner.manager.findOne(product_entity_1.Product, { where: { id: productoId } });
            if (!producto) {
                throw new common_1.NotFoundException(`Producto con ID ${productoId} no encontrado.`);
            }
            const nuevoLote = this.inventoryBatchRepository.create({
                ...createDto,
                producto: producto,
            });
            await queryRunner.manager.save(nuevoLote);
            await this.updateWarehouseStock(queryRunner.manager, producto.id, almacen, cantidad);
            const allStocks = await queryRunner.manager.find(product_warehouse_stock_entity_1.ProductWarehouseStock, { where: { productoId: producto.id } });
            const nuevoStockTotal = allStocks.reduce((sum, s) => sum + Number(s.cantidad), 0);
            await queryRunner.manager.update(product_entity_1.Product, producto.id, { stock: nuevoStockTotal });
            const movement = queryRunner.manager.create(movement_entity_1.Movement, {
                productoId: producto.id,
                tipo: 'ENTRADA',
                cantidad: cantidad,
                nuevoStock: nuevoStockTotal,
                nota: `Ingreso por creación de lote: ${numeroLote}`,
                almacenDestino: almacen,
            });
            await queryRunner.manager.save(movement);
            await queryRunner.commitTransaction();
            return nuevoLote;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateBatch(id, updateDto) {
        const lote = await this.inventoryBatchRepository.preload({
            id: id,
            ...updateDto,
        });
        if (!lote) {
            throw new common_1.NotFoundException(`Lote con ID ${id} no encontrado.`);
        }
        return this.inventoryBatchRepository.save(lote);
    }
    async removeBatch(id) {
        const lote = await this.inventoryBatchRepository.findOneBy({ id });
        if (!lote) {
            throw new common_1.NotFoundException(`Lote con ID ${id} no encontrado.`);
        }
        await this.inventoryBatchRepository.remove(lote);
        return { message: `Lote con ID ${id} eliminado.` };
    }
};
exports.MovementsService = MovementsService;
exports.MovementsService = MovementsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(movement_entity_1.Movement)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(technician_entity_1.Technician)),
    __param(3, (0, typeorm_1.InjectRepository)(inventory_batch_entity_1.InventoryBatch)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], MovementsService);
//# sourceMappingURL=movements.service.js.map