import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; 
import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Provider } from '../providers/entities/provider.entity';
import { ProductSerial, SerialStatus } from './entities/product-serial.entity'; 
import { Movement } from '../movements/entities/movement.entity';

// Define an interface for the parameters of the findAll method
export interface FindAllParams {
  page?: number;
  limit?: number;
  isActive?: boolean | 'all';
  search?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    private readonly dataSource: DataSource,
  ) {}

  // Crear un producto
  async create(createProductDto: CreateProductDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { serials, nota, ...productData } = createProductDto;

      if (productData.proveedorId) {
        const provider = await queryRunner.manager.findOneBy(Provider, { id: productData.proveedorId });
        if (!provider) {
          throw new NotFoundException(`Proveedor con ID ${productData.proveedorId} no encontrado.`);
        }
      }

      // 💡 CORRECCIÓN: Aseguramos que siempre haya un almacén por defecto.
      const datosConAlmacen = {
        ...productData,
        isSerialized: productData.isSerialized || false,
        almacen: productData.almacen || 'Principal',
        nota: nota, // <-- Añadimos la nota al objeto del producto
      };

      const serie = datosConAlmacen.serie?.trim();
      if (!datosConAlmacen.isSerialized && serie) {
        const productoConSerie = await queryRunner.manager
          .getRepository(Product)
          .createQueryBuilder('producto')
          .where('UPPER(TRIM(producto.serie)) = UPPER(TRIM(:serie))', { serie })
          .getOne();

        if (productoConSerie) {
          throw new BadRequestException(
            `La serie '${serie}' ya está registrada en otro producto y no se puede repetir.`,
          );
        }
      }

      if (serie) {
        datosConAlmacen.serie = serie.toUpperCase();
      }
      const nuevoProducto = queryRunner.manager.create(Product, datosConAlmacen);


      if (nuevoProducto.isSerialized && serials && serials.length > 0) {
        const serialesNormalizados = serials
          .map(serial => String(serial).trim())
          .filter(Boolean);
        const uniqueSerials = [...new Set(serialesNormalizados.map(serial => serial.toUpperCase()))];

        // Validar duplicados dentro de la misma lista antes de crear
        if (uniqueSerials.length !== serials.length) {
          throw new BadRequestException('La lista contiene números de serie duplicados.');
        }

        // 💡 ALERTA DE DUPLICADOS: Verificamos si alguno de los seriales ya existe en la DB
        const serialesExistentes = await queryRunner.manager
          .getRepository(ProductSerial)
          .createQueryBuilder('serial')
          .where('UPPER(TRIM(serial.serialNumber)) IN (:...serials)', { serials: uniqueSerials })
          .getMany();

        if (serialesExistentes.length > 0) {
          throw new BadRequestException(`Los siguientes seriales ya existen: ${serialesExistentes.map(s => s.serialNumber).join(', ')}`);
        }

        nuevoProducto.seriales = uniqueSerials.map(serialNumber => { 
          const serialLimpio = serialNumber.trim();
          return queryRunner.manager.create(ProductSerial, {
            serialNumber: serialLimpio,
            status: SerialStatus.DISPONIBLE,
            almacen: nuevoProducto.almacen || 'Principal',
          });
        });
        // El stock para productos serializados SIEMPRE se calcula en el backend
        // para ser la fuente de la verdad, ignorando lo que envíe el frontend.
        nuevoProducto.stock = nuevoProducto.seriales.length;
      }

      const productoGuardado = await queryRunner.manager.save(Product, nuevoProducto);
      await queryRunner.commitTransaction();
      return productoGuardado;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


// Obtener todos los productos con paginación, filtrado y búsqueda
async findAll({ page = 1, limit = 20, isActive = true, search }: FindAllParams = {}) {
  const skip = (page - 1) * limit;

  const query = this.productRepository
    .createQueryBuilder('producto')
    .select([
      'producto.id',
      'producto.nombre',
      'producto.codigo',
      'producto.modelo',
      'producto.serie',
      'producto.categoria',
      'producto.precio',
      'producto.stock',
      'producto.stockMinimo',
      'producto.imagen', 
      'producto.almacen',
      'producto.pasillo',
      'producto.fila',
      'producto.ubicacion',
      'producto.unidadMedida',
      'producto.isActive',
      'producto.isComodato',
      'producto.isSerialized',
      'producto.createdAt',
      'producto.proveedorId',
    ])
    .leftJoinAndSelect('producto.proveedor', 'proveedor')
    .leftJoinAndSelect(
      'producto.seriales',
      'serialDisponible',
      'serialDisponible.status = :serialStatus',
      { serialStatus: SerialStatus.DISPONIBLE },
    )
    .orderBy('producto.createdAt', 'DESC')
    .skip(skip)
    .take(limit);

  // Filtro de activos/inactivos
  if (isActive !== 'all') {
    query.andWhere('producto.isActive = :isActive', { isActive });
  }

  // Buscador rápido integrado directamente en la DB
  if (search) {
    query.andWhere(
      '(LOWER(producto.nombre) LIKE LOWER(:search) OR LOWER(producto.codigo) LIKE LOWER(:search))',
      { search: `%${search}%` },
    );
  }

  const [data, total] = await query.getManyAndCount();

  return {
    data,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
}

  // Obtener uno solo
  async findOne(id: number) {
    const producto = await this.productRepository.findOne({
      where: { id },
      relations: ['proveedor'] // Incluye las relaciones que necesites
    });

    if (!producto) {
      throw new NotFoundException(`El producto con ID ${id} no fue encontrado`);
    }

    return producto;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { serials, ...productData } = updateProductDto;

      const producto = await queryRunner.manager.findOne(Product, {
        where: { id },
        relations: ['seriales'],
      });

      if (!producto) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
      }

      const serie = productData.serie?.trim();
      const isSerializedFinal = productData.isSerialized ?? producto.isSerialized;
      if (!isSerializedFinal && serie) {
        const productoConSerie = await queryRunner.manager
          .getRepository(Product)
          .createQueryBuilder('producto')
          .where('UPPER(TRIM(producto.serie)) = UPPER(TRIM(:serie))', { serie })
          .andWhere('producto.id != :id', { id })
          .getOne();

        if (productoConSerie) {
          throw new BadRequestException(
            `La serie '${serie}' ya está registrada en otro producto y no se puede repetir.`,
          );
        }
      }

      if (serie) {
        productData.serie = serie.toUpperCase();
      }

      const almacenOriginal = producto.almacen;
      const almacenNuevo = productData.almacen;
      const cambioDeAlmacen = almacenNuevo && almacenOriginal !== almacenNuevo;

      // Actualiza los datos del producto principal en la entidad cargada
      queryRunner.manager.merge(Product, producto, productData);

      // Si el producto no es serializado y cambia de almacén, transferimos el stock.
      if (!producto.isSerialized && cambioDeAlmacen && producto.stock > 0) {
        // Lógica de transferencia de stock que añadiremos
      }

      if (producto.isSerialized) {
        const serialesActuales = producto.seriales || [];
        const serialesNuevos = serials ?? [];
        const serialesNuevosStr = [...new Set(serialesNuevos
          .map(s => String(s).trim().toUpperCase())
          .filter(Boolean))];

        if (serials && serialesNuevosStr.length !== serials.length) {
          throw new BadRequestException('La lista de seriales contiene duplicados.');
        }

        const serialesActualesStr = serialesActuales.map(s => s.serialNumber.trim().toUpperCase());

        // 1. Identificar seriales a eliminar
        const serialesAEliminar = serialesActuales.filter(
          s => !serialesNuevosStr.includes(s.serialNumber.trim().toUpperCase()),
        );

        for (const serial of serialesAEliminar) {
          if (serial.status !== SerialStatus.DISPONIBLE) {
            throw new BadRequestException(`No se puede eliminar el serial '${serial.serialNumber}' porque su estado es '${serial.status}'.`);
          }
        }
        
        if (serialesAEliminar.length > 0) {
          await queryRunner.manager.remove(serialesAEliminar);
        }

        // 2. Identificar y crear nuevos seriales
        const serialesACrear = serialesNuevosStr
          .filter(s => !serialesActualesStr.includes(s))
          .map(serialNumber => queryRunner.manager.create(ProductSerial, {
            productoId: id,
            serialNumber,
            status: SerialStatus.DISPONIBLE,
            almacen: productData.almacen ?? producto.almacen ?? 'Principal',
          }));

        if (serialesACrear.length > 0) {
          const numerosDeSerialesACrear = serialesACrear.map(s => s.serialNumber);
          const serialesExistentesEnDB = await queryRunner.manager
            .getRepository(ProductSerial)
            .createQueryBuilder('serial')
            .where('UPPER(TRIM(serial.serialNumber)) IN (:...serials)', { serials: numerosDeSerialesACrear })
            .getMany();
          if (serialesExistentesEnDB.length > 0) {
            throw new BadRequestException(`No se puede añadir, los seriales ya existen: ${serialesExistentesEnDB.map(s => s.serialNumber).join(', ')}`);
          }
        }

        if (serialesACrear.length > 0) {
          await queryRunner.manager.save(ProductSerial, serialesACrear);
        }

        // 💡 LA SOLUCIÓN DEFINITIVA: 
        // En lugar de sumar y restar manualmente con variables locales que pueden fallar,
        // consultamos directamente a la BD cuántos seriales 'DISPONIBLE' exactos tiene este producto ahora mismo.
        const stockRealCalculado = await queryRunner.manager.count(ProductSerial, {
          where: {
            productoId: id,
            status: SerialStatus.DISPONIBLE,
          },
        });

        // Asignamos el stock real basado en la base de datos
        producto.stock = stockRealCalculado;
      }

      // Si hubo cambio de almacén, ajustamos el stock desglosado
      if (!producto.isSerialized && cambioDeAlmacen && producto.stock > 0) {
        const stockATransferir = Number(producto.stock);
        // Restar del origen
        await queryRunner.manager.query(
          `UPDATE product_warehouse_stock SET cantidad = cantidad - $1 WHERE "productoId" = $2 AND almacen = $3`,
          [stockATransferir, id, almacenOriginal]
        );
        // Sumar al destino (o crearlo si no existe)
        await queryRunner.manager.query(
          `INSERT INTO product_warehouse_stock ("productoId", almacen, cantidad) VALUES ($1, $2, $3)
           ON CONFLICT ("productoId", almacen) DO UPDATE SET cantidad = product_warehouse_stock.cantidad + $3`,
          [id, almacenNuevo, stockATransferir]
        );
        // Registrar movimiento en Kardex
        const movementLog = queryRunner.manager.create(Movement, {
          productoId: id,
          tipo: 'TRANSFERENCIA',
          cantidad: stockATransferir,
          nota: `Cambio de almacén principal de ${almacenOriginal} a ${almacenNuevo}`,
          almacenOrigen: almacenOriginal,
          almacenDestino: almacenNuevo,
        } as any);
        await queryRunner.manager.save(movementLog);
      }

      // 3. Guardamos la entidad 'producto' completa.
      // El método 'save' respeta las relaciones y cascadas, asegurando que todo se sincronice.
      const productoActualizado = await queryRunner.manager.save(Product, producto);

      await queryRunner.commitTransaction();
      return productoActualizado;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    // 1. Verificamos que el producto exista primero
    const producto = await this.findOne(id);
    
    if (!producto.isActive) {
      throw new BadRequestException(`El producto con ID ${id} ya se encuentra inactivo.`);
    }

    // 2. Usamos .update() directo apuntando al ID. 
    // Esto modifica ÚNICAMENTE la tabla 'products' e ignora por completo el 'cascade: true'
    await this.productRepository.update(id, { isActive: false });
    
    // 3. Retornamos el objeto actualizado de forma segura para la respuesta del controlador
    return { ...producto, isActive: false };
  }

  // Restaurar producto (Borrado lógico inverso)
  async restore(id: number) {
    const producto = await this.findOne(id); // Valida que exista (incluso si está inactivo)
    
    if (producto.isActive) {
      throw new BadRequestException(`El producto con ID ${id} ya está activo.`);
    }

    producto.isActive = true;
    return await this.productRepository.save(producto);
  }

  // --- NUEVO MÉTODO PARA EL RESUMEN DE INVENTARIO ---
  async getInventorySummary() {
    // 1. Calcular el valor total del inventario (solo de productos activos)
    const totalValueResult = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM(product.stock * product.precio)', 'totalValue')
      .where('product.isActive = :isActive', { isActive: true })
      .getRawOne();

    const totalValue = parseFloat(totalValueResult.totalValue) || 0;

    // 2. Contar productos por categoría (solo de productos activos)
    const productsPerCategory = await this.productRepository
      .createQueryBuilder('product')
      .select('product.categoria', 'category')
      .addSelect('COUNT(product.id)', 'count')
      .where('product.isActive = :isActive', { isActive: true })
      .groupBy('product.categoria')
      .orderBy('count', 'DESC')
      .getRawMany();

    // 3. Contar el total de productos y el stock total (solo de productos activos)
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
}
