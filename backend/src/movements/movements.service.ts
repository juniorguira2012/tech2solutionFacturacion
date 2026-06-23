import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Not, In } from 'typeorm';
import { Movement } from './entities/movement.entity';
import { CreateBulkMovementDto } from './dto/create-bulk-movement.dto';
import { ReturnSerialDto } from './dto/return-serial.dto';
import { AssignSerialsToTechnicianDto } from './dto/assign-serials.dto';
import { Product } from '../products/entities/product.entity';
import { CreateMovementDto } from './dto/create-movement.dto';
import { ProductWarehouseStock } from '../products/entities/product-warehouse-stock.entity';
import { ProductSerial, SerialStatus } from '../products/entities/product-serial.entity';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { Technician } from './entities/technician.entity';

@Injectable()
export class MovementsService {
  constructor(
    @InjectRepository(Movement)
    private movementRepository: Repository<Movement>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Technician)
    private technicianRepository: Repository<Technician>,
    private dataSource: DataSource,
  ) {}

  async findTechnicians() {
    return this.technicianRepository.find({
      where: { isActive: true },
      order: { nombre: 'ASC' },
    });
  }

  async createTechnician(payload: { nombre: string; telefono?: string; email?: string }) {
    const nombre = payload.nombre?.trim();
    if (!nombre) {
      throw new BadRequestException('El nombre del técnico es obligatorio');
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

  async updateTechnician(id: number, payload: { nombre?: string; telefono?: string; email?: string; isActive?: boolean }) {
    const technician = await this.technicianRepository.findOne({ where: { id } });
    if (!technician) {
      throw new NotFoundException(`Técnico ID ${id} no encontrado`);
    }

    const nombre = payload.nombre?.trim();
    if (nombre) {
      const duplicado = await this.technicianRepository.findOne({
        where: { nombre, id: Not(id) },
      });
      if (duplicado) {
        throw new BadRequestException('Ya existe otro técnico con ese nombre');
      }
      technician.nombre = nombre;
    }

    if (payload.telefono !== undefined) technician.telefono = payload.telefono?.trim() || undefined;
    if (payload.email !== undefined) technician.email = payload.email?.trim() || undefined;
    if (payload.isActive !== undefined) technician.isActive = Boolean(payload.isActive);

    return this.technicianRepository.save(technician);
  }

  async deleteTechnician(id: number) {
    const technician = await this.technicianRepository.findOne({ where: { id } });
    if (!technician) {
      throw new NotFoundException(`Técnico ID ${id} no encontrado`);
    }

    technician.isActive = false;
    return this.technicianRepository.save(technician);
  }

  private async resolveTechnician(
    manager: EntityManager,
    technicianId?: number,
    technicianName?: string,
  ) {
    if (technicianId) {
      const technician = await manager.findOne(Technician, { where: { id: Number(technicianId) } });
      if (!technician) throw new NotFoundException(`Técnico ID ${technicianId} no encontrado`);
      return technician;
    }

    const nombre = technicianName?.trim();
    if (!nombre) return null;

    const existente = await manager.findOne(Technician, { where: { nombre } });
    if (existente) return existente;

    const nuevo = manager.create(Technician, { nombre });
    return manager.save(Technician, nuevo);
  }

  private async updateWarehouseStock(
    manager: EntityManager,
    productoId: number,
    almacen: string,
    cantidad: number,
    isAbsolute: boolean = false,
  ) {
    if (!almacen) return;

    const nombreAlmacen = almacen.trim();
    const idProducto = Number(productoId);
    const cantidadNueva = Number(cantidad);

    const existeStock = await manager.findOne(ProductWarehouseStock, {
      where: { productoId: idProducto, almacen: nombreAlmacen },
    });

    if (!existeStock) {
      const stockInicial = isAbsolute ? cantidadNueva : (cantidadNueva < 0 ? 0 : cantidadNueva);
      
      const nuevoStockEntry = manager.create(ProductWarehouseStock, {
        productoId: idProducto,
        almacen: nombreAlmacen,
        cantidad: stockInicial,
      });
      await manager.save(ProductWarehouseStock, nuevoStockEntry);

    } else {
      const nuevaCantidadCalculada = isAbsolute 
        ? cantidadNueva 
        : Number(existeStock.cantidad) + cantidadNueva;

      await manager.update(ProductWarehouseStock, 
        { productoId: idProducto, almacen: nombreAlmacen },
        { cantidad: nuevaCantidadCalculada }
      );
    }
  }

  private async generateAndSaveBatch(
    manager: EntityManager,
    productoId: number,
    cantidad: number,
    almacen: string,
    providedBatchNumber?: string,
  ) {
    const batchNumber = providedBatchNumber || `LOTE-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const batchEntry = manager.create(InventoryBatch, {
      productoId: productoId,
      numeroLote: batchNumber,
      cantidad: cantidad,
      almacen: almacen,
      fechaVencimiento: expiryDate,
    });
    await manager.save(InventoryBatch, batchEntry);

    return batchNumber;
  }

  private async ensureDetailedStockInitialized(manager: EntityManager, producto: Product) {
    const count = await manager.count(ProductWarehouseStock, {
      where: { productoId: producto.id },
    });

    if (count === 0 && Number(producto.stock) > 0 && producto.almacen) {
      const entry = manager.create(ProductWarehouseStock, {
        productoId: producto.id,
        almacen: producto.almacen,
        cantidad: producto.stock,
      });
      await manager.save(ProductWarehouseStock, entry);
    }
  }

  async transferBulk(transferData: { 
    productoId: number; 
    almacenOrigen: string; 
    almacenDestino: string; 
    cantidad: number; 
    nota: string; 
    usuarioId?: any 
  }) {
    const { productoId, almacenOrigen, almacenDestino, cantidad, nota, usuarioId } = transferData;

    if (almacenOrigen === almacenDestino) {
      throw new BadRequestException('El almacén de origen y destino no pueden ser iguales.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const producto = await queryRunner.manager.findOne(Product, { where: { id: productoId } });
      if (!producto) {
        throw new NotFoundException(`Producto ID ${productoId} no encontrado`);
      }

      await this.ensureDetailedStockInitialized(queryRunner.manager, producto);

      const cantidadNumerica = Number(cantidad);

      const stockOrigen = await queryRunner.manager.findOne(ProductWarehouseStock, {
        where: { productoId: producto.id, almacen: almacenOrigen.trim() }
      });

      const stockDisponibleOrigen = stockOrigen ? Number(stockOrigen.cantidad) : 0;
      if (stockDisponibleOrigen < cantidadNumerica) {
        throw new BadRequestException(
          `Stock insuficiente en ${almacenOrigen} para ${producto.nombre}. Disponible: ${stockDisponibleOrigen}, Requerido: ${cantidadNumerica}`
        );
      }

      await this.updateWarehouseStock(queryRunner.manager, productoId, almacenOrigen, -cantidadNumerica);
      await this.updateWarehouseStock(queryRunner.manager, productoId, almacenDestino, cantidadNumerica);

      const logSalida = queryRunner.manager.create(Movement, {
        producto: producto, 
        productoId: producto.id,
        tipo: 'SALIDA',
        cantidad: cantidadNumerica,
        nuevoStock: Number(producto.stock),
        nota: `TRANSFERENCIA (ORIGEN: ${almacenOrigen} -> DESTINO: ${almacenDestino}) | ${nota}`,
        almacenOrigen: almacenOrigen,
        almacenDestino: almacenDestino,
        usuarioId: usuarioId ? String(usuarioId) : undefined
      } as any);
      await queryRunner.manager.save(Movement, logSalida);

      const logEntrada = queryRunner.manager.create(Movement, {
        producto: producto,
        productoId: producto.id,
        tipo: 'ENTRADA',
        cantidad: cantidadNumerica,
        nuevoStock: Number(producto.stock),
        nota: `TRANSFERENCIA (RECIBIDO DESDE: ${almacenOrigen}) | ${nota}`,
        almacenOrigen: almacenOrigen,
        almacenDestino: almacenDestino,
        usuarioId: usuarioId ? String(usuarioId) : undefined
      } as any);
      await queryRunner.manager.save(Movement, logEntrada);

      await queryRunner.commitTransaction();
      return { message: 'Transferencia procesada con éxito', productoId, cantidad: cantidadNumerica };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async create(createMovementDto: CreateMovementDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const {
      productoId,
      tipo,
      cantidad,
      nota,
      usuarioId,
      almacenOrigen,
      almacenDestino,
      referencia,
      lote,
      technicianId,
      technicianName,
    } = createMovementDto as any;

    try {
      let batchGenerated = '';
      const producto = await queryRunner.manager.findOne(Product, { where: { id: Number(productoId) } });
      if (!producto) {
        throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
      }

      await this.ensureDetailedStockInitialized(queryRunner.manager, producto);

      const tipoNormalizado = tipo.toUpperCase();
      const cantidadNumerica = Number(cantidad);
      let nuevoStock = Number(producto.stock);
      const technician = await this.resolveTechnician(queryRunner.manager, technicianId, technicianName);
      
      const targetAlmacen = (almacenDestino || almacenOrigen || producto.almacen || 'Principal').trim();

      if (tipoNormalizado === 'TRANSFERIR') {
        if (!almacenOrigen || !almacenDestino) {
          throw new BadRequestException('Para una transferencia se requiere un almacén de origen y uno de destino.');
        }
        
        const stockOrigen = await queryRunner.manager.findOne(ProductWarehouseStock, {
          where: { productoId: producto.id, almacen: almacenOrigen.trim() }
        });
        const disponibleOrigen = stockOrigen ? Number(stockOrigen.cantidad) : 0;
        if (disponibleOrigen < cantidadNumerica) {
          throw new BadRequestException(
            `Stock insuficiente en almacén de origen '${almacenOrigen}'. Disponible: ${disponibleOrigen}, Requerido: ${cantidadNumerica}`
          );
        }

        await this.updateWarehouseStock(queryRunner.manager, producto.id, almacenOrigen, -cantidadNumerica);
        await this.updateWarehouseStock(queryRunner.manager, producto.id, almacenDestino, cantidadNumerica);
        
      } else {
        const tiposIncremento = ['ENTRADA', 'RECIBIR', 'DEVOLUCION_FACTURA'];
        const tiposDecremento = ['SALIDA', 'DESPACHAR', 'DESCARTAR', 'DEVOLUCION']; 

        if (tiposIncremento.includes(tipoNormalizado)) {
          nuevoStock += cantidadNumerica;
          await this.updateWarehouseStock(queryRunner.manager, producto.id, targetAlmacen, cantidadNumerica);
          batchGenerated = await this.generateAndSaveBatch(queryRunner.manager, producto.id, cantidadNumerica, targetAlmacen, lote);

        } else if (tiposDecremento.includes(tipoNormalizado)) {
          const stockEnAlmacen = await queryRunner.manager.findOne(ProductWarehouseStock, {
            where: { productoId: producto.id, almacen: targetAlmacen }
          });
          
          const cantidadDisponibleAlmacen = stockEnAlmacen ? Number(stockEnAlmacen.cantidad) : 0;

          if (cantidadDisponibleAlmacen < cantidadNumerica) {
            throw new BadRequestException(
              `Stock insuficiente en el almacén '${targetAlmacen}' para ${producto.nombre}. Disponible: ${cantidadDisponibleAlmacen}, Solicitado: ${cantidadNumerica}`
            );
          }

          nuevoStock -= cantidadNumerica; 
          await this.updateWarehouseStock(queryRunner.manager, producto.id, targetAlmacen, -cantidadNumerica);

        } else if (tipoNormalizado === 'AJUSTE' || tipoNormalizado === 'AJUSTAR') {
          if (cantidadNumerica < 0) throw new BadRequestException('El stock no puede ser negativo tras un ajuste');
          
          await this.updateWarehouseStock(queryRunner.manager, producto.id, targetAlmacen, cantidadNumerica, true);
          
          const allStocks = await queryRunner.manager.find(ProductWarehouseStock, { where: { productoId: producto.id } });
          nuevoStock = allStocks.reduce((sum, s) => sum + Number(s.cantidad), 0);

          if (createMovementDto.costoUnitario !== undefined && createMovementDto.costoUnitario !== null) {
            producto.precio = Number(createMovementDto.costoUnitario);
          }
          
        } else {
          throw new BadRequestException(`Tipo de movimiento no válido: ${tipo}`);
        }

        producto.stock = nuevoStock;
      }

      await queryRunner.manager.update(Product, producto.id, { 
        stock: nuevoStock,
        precio: producto.precio 
      });

      const movement = queryRunner.manager.create(Movement, {
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
      } as any);

      const savedMovement = await queryRunner.manager.save(Movement, movement);
      if (technician) savedMovement.technician = technician;

      await queryRunner.commitTransaction();
      return savedMovement;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * PROCESAR RECIBO / DESPACHO MASIVO (Atómico)
   */
  async createBulk(bulkData: CreateBulkMovementDto) {
    const { tipo, nota, items, usuarioId, referencia } = bulkData;

    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Debe incluir al menos una línea de mercancía');
    }
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const movimientosCreados: Movement[] = [];
      const tipoNormalizado = tipo ? tipo.trim().toUpperCase() : 'RECIBIR';
      const finalUsuarioId = (usuarioId && !isNaN(Number(usuarioId))) ? String(usuarioId) : undefined;
      const tiposIncremento = ['ENTRADA', 'RECIBIR', 'DEVOLUCION_FACTURA'];
      const tiposDecremento = ['SALIDA', 'DESPACHAR', 'DESCARTAR', 'DEVOLUCION'];

      if (!tiposIncremento.includes(tipoNormalizado) && !tiposDecremento.includes(tipoNormalizado)) {
        throw new BadRequestException(`Tipo de movimiento masivo no válido: ${tipo}`);
      }

      for (const [index, item] of items.entries()) {
        const { productoId, cantidad, almacen, lote, serials } = item;
        const idNum = Number(productoId);
        const numeroLinea = index + 1;
        
        if (!productoId || isNaN(idNum)) {
          throw new BadRequestException(`Línea ${numeroLinea}: producto inválido`);
        }
        
        const almacenNormalizado = String(almacen || 'Principal').trim() || 'Principal';

        const producto = await queryRunner.manager.findOne(Product, { where: { id: idNum } }) as any;
        
        if (!producto) {
          throw new NotFoundException(`Producto ID ${productoId} no encontrado en la base de datos`);
        }

        await this.ensureDetailedStockInitialized(queryRunner.manager, producto);

        let nuevoStock = Number(producto.stock);
        let batchInfo = '';

        // --- INICIO DE LA LÓGICA DE SERIALIZACIÓN ---
        if (producto.isSerialized) {
          if (!Array.isArray(serials) || serials.length === 0) {
            throw new BadRequestException(`Línea ${numeroLinea} (${producto.nombre}): Debe proporcionar una lista de seriales para este producto.`);
          }

          const totalSeriales = serials.length;

          if (tiposIncremento.includes(tipoNormalizado)) {
            for (const serialNumber of serials) {
              const serialLimpio = serialNumber.trim();
              if (!serialLimpio) continue;

              // --- Validación de duplicados ---
              const serialExistente = await queryRunner.manager.findOne(ProductSerial, {
                where: {
                  productoId: producto.id,
                  serialNumber: serialLimpio,
                },
              });

              if (serialExistente) {
                throw new BadRequestException(`El serial "${serialLimpio}" ya ha sido registrado para el producto "${producto.nombre}".`);
              }

              const nuevoSerial = queryRunner.manager.create(ProductSerial, {
                productoId: producto.id,
                serialNumber: serialLimpio,
                almacen: almacenNormalizado,
                status: SerialStatus.DISPONIBLE,
              });
              await queryRunner.manager.save(ProductSerial, nuevoSerial);
            }
            
            await this.updateWarehouseStock(queryRunner.manager, producto.id, almacenNormalizado, totalSeriales);
            nuevoStock = await queryRunner.manager.count(ProductSerial, { where: { productoId: producto.id, status: SerialStatus.DISPONIBLE } });
          } else { 
            // Despacho / Salida de serializados
            for (const serialNumber of serials) {
               const serialADespachar = await queryRunner.manager.findOne(ProductSerial, { 
                 where: { productoId: producto.id, serialNumber: serialNumber.trim(), status: SerialStatus.DISPONIBLE }
               });
               if (!serialADespachar) {
                 throw new BadRequestException(`Serial "${serialNumber}" no encontrado o no disponible en el inventario.`);
               }
               serialADespachar.status = SerialStatus.VENDIDO; 
               await queryRunner.manager.save(ProductSerial, serialADespachar);
            }
            
            await this.updateWarehouseStock(queryRunner.manager, producto.id, almacenNormalizado, -totalSeriales);
            nuevoStock = await queryRunner.manager.count(ProductSerial, { where: { productoId: producto.id, status: SerialStatus.DISPONIBLE } });
          }
        } else { 
          // Lógica original para productos no serializados
          const cantidadNumerica = Number(cantidad);
          if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
            throw new BadRequestException(`Línea ${numeroLinea}: la cantidad debe ser mayor a 0`);
          }
          if (tiposIncremento.includes(tipoNormalizado)) {
            nuevoStock += cantidadNumerica;
            await this.updateWarehouseStock(queryRunner.manager, producto.id, almacenNormalizado, cantidadNumerica);
            batchInfo = await this.generateAndSaveBatch(queryRunner.manager, idNum, cantidadNumerica, almacenNormalizado, lote);
          } else if (tiposDecremento.includes(tipoNormalizado)) {
            const stockEnAlmacen = await queryRunner.manager.findOne(ProductWarehouseStock, {
              where: { productoId: producto.id, almacen: almacenNormalizado }
            });

            const cantidadDisponibleAlmacen = stockEnAlmacen ? Number(stockEnAlmacen.cantidad) : 0;

            if (cantidadDisponibleAlmacen < cantidadNumerica) {
              throw new BadRequestException(
                `Stock insuficiente en el almacén '${almacenNormalizado}' para ${producto.nombre}. Disponible: ${cantidadDisponibleAlmacen}, Solicitado: ${cantidadNumerica}`
              );
            }
            nuevoStock -= cantidadNumerica;
            await this.updateWarehouseStock(queryRunner.manager, producto.id, almacenNormalizado, -cantidadNumerica);
          }
        }
        // --- FIN DE LA LÓGICA DE SERIALIZACIÓN ---

        await queryRunner.manager.update(Product, producto.id, { stock: nuevoStock });
        producto.stock = nuevoStock;

        // Corregido el posible undefined usando un fallback seguro
        const cantidadMovimiento = producto.isSerialized ? (serials?.length || 0) : Number(cantidad);
        const nuevoMovimiento = queryRunner.manager.create(Movement, {
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
        } as any);

        const guardado = await queryRunner.manager.save(Movement, nuevoMovimiento);
        movimientosCreados.push(guardado);
      }

      if (movimientosCreados.length === 0) {
        throw new BadRequestException('No se procesó ninguna línea de mercancía');
      }

      await queryRunner.commitTransaction();
      return { success: true, count: movimientosCreados.length, data: movimientosCreados };

    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      console.error("Error crítico en Bulk Movement:", err);
      throw new BadRequestException(`No se pudo procesar el movimiento: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async assignSerialsToTechnician(dto: AssignSerialsToTechnicianDto) {
    const { technicianId, serials, usuarioId } = dto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const technician = await queryRunner.manager.findOne(Technician, { where: { id: technicianId } });
      if (!technician) {
        throw new NotFoundException(`Técnico con ID ${technicianId} no encontrado.`);
      }

      const uniqueSerials = [...new Set(serials.map(s => s.trim()).filter(Boolean))];
      if (uniqueSerials.length === 0) {
        throw new BadRequestException('Debe proporcionar al menos un número de serie válido.');
      }

      const productSerials = await queryRunner.manager.find(ProductSerial, {
        where: { serialNumber: In(uniqueSerials) },
        relations: ['producto'],
      });

      if (productSerials.length !== uniqueSerials.length) {
        const foundSerials = productSerials.map(ps => ps.serialNumber);
        const notFound = uniqueSerials.filter(s => !foundSerials.includes(s));
        throw new NotFoundException(`Los siguientes seriales no se encontraron: ${notFound.join(', ')}`);
      }

      const movementsToCreate: any[] = []; // 👈 Cambiado a any[] temporalmente para evadir la restricción estricta de TypeORM
      const productsToUpdate = new Map<number, number>();

      for (const serial of productSerials) {
        if (serial.status !== SerialStatus.DISPONIBLE) {
          throw new BadRequestException(`El serial ${serial.serialNumber} no está disponible (estado actual: ${serial.status}).`);
        }
        
        // 1. Cambiar estado del serial a asignado
        serial.status = SerialStatus.ASIGNADO_TECNICO;
        await queryRunner.manager.save(ProductSerial, serial);

        const productId = serial.productoId;
        if (!productsToUpdate.has(productId)) {
          const stock = await queryRunner.manager.count(ProductSerial, {
            where: { productoId: productId, status: SerialStatus.DISPONIBLE },
          });
          productsToUpdate.set(productId, stock);
        }

        // 2. Construir el objeto del movimiento usando casting seguro
        movementsToCreate.push({
          productoId: productId,
          tipo: 'ASIGNACION_TECNICO',
          cantidad: 1,
          nota: `Asignado al técnico: ${technician.nombre} | Serial: ${serial.serialNumber}`,
          serials: [serial.serialNumber], // 👈 Ahora pasará sin chistar por el cambio de tipo de la lista
          technicianId: technician.id,
          usuarioId: usuarioId ? String(usuarioId) : undefined,
          nuevoStock: productsToUpdate.get(productId),
          almacenOrigen: serial.almacen,
          almacenDestino: 'Móvil (Técnico)',
        });
      }

      // 3. Actualizar los stocks globales de los productos afectados
      for (const [productId, newStock] of productsToUpdate.entries()) {
        await queryRunner.manager.update(Product, productId, { stock: newStock });
      }

      // 4. Guardar los logs de movimientos de forma masiva
      await queryRunner.manager.save(Movement, movementsToCreate);
      await queryRunner.commitTransaction();

      return { message: `${uniqueSerials.length} serial(es) asignado(s) a ${technician.nombre} con éxito.` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async returnSerialFromTechnician(dto: ReturnSerialDto, usuarioId: string) {
    const { serialNumber, nota } = dto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Encontrar el serial y validar su estado
      const serial = await queryRunner.manager.findOne(ProductSerial, {
        where: { serialNumber: serialNumber.trim() },
        relations: ['producto'],
      });

      if (!serial) {
        throw new NotFoundException(`El serial '${serialNumber}' no fue encontrado.`);
      }

      if (serial.status !== SerialStatus.ASIGNADO_TECNICO) {
        throw new BadRequestException(`El serial '${serialNumber}' no está asignado a un técnico (estado actual: ${serial.status}).`);
      }

      // 2. Cambiar el estado del serial a 'disponible'
      serial.status = SerialStatus.DISPONIBLE;
      await queryRunner.manager.save(ProductSerial, serial);

      // 3. Actualizar el stock del producto asociado
      const producto = serial.producto;
      if (producto) {
        const nuevoStock = await queryRunner.manager.count(ProductSerial, {
          where: { productoId: producto.id, status: SerialStatus.DISPONIBLE },
        });
        await queryRunner.manager.update(Product, producto.id, { stock: nuevoStock });

        // 4. Registrar el movimiento de devolución en el Kardex
        const movement = queryRunner.manager.create(Movement, {
          productoId: producto.id,
          tipo: 'DEVOLUCION_TECNICO',
          cantidad: 1,
          nuevoStock: nuevoStock,
          nota: `Devolución de técnico. ${nota || ''}`.trim(),
          serials: [serial.serialNumber],
          usuarioId: usuarioId,
          almacenOrigen: 'Móvil (Técnico)',
          almacenDestino: serial.almacen, // Vuelve a su almacén original
        } as any);
        await queryRunner.manager.save(Movement, movement);
      }

      await queryRunner.commitTransaction();
      return { message: `Serial '${serialNumber}' devuelto al inventario con éxito.` };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.movementRepository.find({
      relations: ['producto', 'technician', 'usuario'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByProductId(productoId: number) {
    return await this.movementRepository.find({
      where: { productoId },
      relations: ['producto', 'technician', 'usuario'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySerialNumber(serialNumber: string) {
    return this.movementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.producto', 'producto')
      .leftJoinAndSelect('movement.usuario', 'usuario')
      .where(`movement.serials @> :serial`, { serial: `["${serialNumber}"]` })
      .orderBy('movement.createdAt', 'DESC')
      .getMany();
  }
}