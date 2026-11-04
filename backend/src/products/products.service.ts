import { Injectable, Scope, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm'; 
import { Repository, DataSource, ObjectLiteral } from 'typeorm';
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

@Injectable({ scope: Scope.REQUEST })
export class ProductsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSource: DataSource,
  ) {}

  // Método auxiliar para obtener el DataSource activo (del tenant actual o el principal)
  private getActiveDataSource(): DataSource {
    return this.request['tenantDataSource'] || this.dataSource;
  }
  // Método auxiliar para obtener el repositorio apuntando a la base de datos del tenant actual
  private async getRepository<T extends ObjectLiteral>(entity: new (...args: any[]) => T): Promise<Repository<T>> {
    const tenantDataSource = this.getActiveDataSource();
    return tenantDataSource.getRepository(entity);
  
  }

  private async getTenantDataSource(dbName: string): Promise<DataSource> {
    if (!global['tenantDataSources']) {
      global['tenantDataSources'] = {};
    }

    // 💡 Blindaje local: si entra el nombre por defecto de prod en entorno de desarrollo, lo redirigimos a tu BD local
    const targetDb = (process.env.NODE_ENV !== 'production' && dbName === 'tech_two_solution_db') 
      ? 'tech2_prueba_db' 
      : dbName;

    if (!global['tenantDataSources'][targetDb]) {
      const mainOptions = this.dataSource.options as any;
      const tenantOptions = {
        ...mainOptions,
        database: targetDb,
        name: `tenant_${targetDb}_${Date.now()}`,
        synchronize: false,
        entities: mainOptions.entities,
      };
      
      const newDataSource = new DataSource(tenantOptions);
      await newDataSource.initialize(); // 🚀 ¡Esperamos a que carguen los metadatos!
      global['tenantDataSources'][targetDb] = newDataSource;
    } else {
      const ds = global['tenantDataSources'][targetDb];
      if (!ds.isInitialized) {
        await ds.initialize();
      }
    }

    return global['tenantDataSources'][targetDb];
  }


  // Crear un producto
  async create(createProductDto: CreateProductDto) {
    // Usamos el DataSource del tenant actual para las transacciones
    const tenantDataSourceInstance = this.getActiveDataSource();
    
    const queryRunner = tenantDataSourceInstance.createQueryRunner();
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

      const datosConAlmacen = {
        ...productData,
        isSerialized: productData.isSerialized || false,
        almacen: productData.almacen || 'Principal',
        nota: nota,
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

        if (uniqueSerials.length !== serials.length) {
          throw new BadRequestException('La lista contiene números de serie duplicados.');
        }

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

  // 🌟 Método para consultar los seriales disponibles de un producto específico bajo demanda
  async findSerialsByProduct(productId: number) {
    // 💡 Añadimos await aquí para esperar que el repositorio esté listo
    const productSerialRepo = await this.getRepository(ProductSerial);
    
    return productSerialRepo.find({
      where: { 
        productoId: productId, 
        status: SerialStatus.DISPONIBLE 
      },
      select: ['id', 'serialNumber', 'status', 'createdAt'] // Selecciona solo lo necesario de forma ultra ligera
    });
  }

  // Obtener todos los productos con paginación, filtrado y búsqueda (Súper ligero sin el join masivo de seriales)
  async findAll({ page = 1, limit = 20, isActive = true, search }: FindAllParams = {}) {
      const productRepo = await this.getRepository(Product);
      const take = Math.min(Number(limit) || 20, 50);
      const skip = (Math.max(Number(page), 1) - 1) * take;

      const query = productRepo
        .createQueryBuilder('producto')
        .leftJoinAndSelect('producto.proveedor', 'proveedor')
        .loadRelationCountAndMap(
          'producto.totalSerialesDisponibles',
          'producto.seriales',
          'serialDisponible',
          (qb) => qb.where('serialDisponible.status = :status', { status: SerialStatus.DISPONIBLE })
        )
        .orderBy('producto.createdAt', 'DESC')
        .take(take)
        .skip(skip);

      if (isActive !== 'all' && isActive !== undefined) {
        const isTrue = String(isActive) === 'true';
        query.andWhere('producto.isActive = :isActive', { isActive: isTrue });
      }

      if (search && search.trim() !== '') {
        const term = `%${search.trim().toLowerCase()}%`;
        query.andWhere(
          '(LOWER(producto.nombre) LIKE :term OR LOWER(producto.codigo) LIKE :term)',
          { term },
        );
      }

      const [items, total] = await query.getManyAndCount();

      return {
        data: items,
        meta: {
          total,
          page: Number(page),
          lastPage: Math.ceil(total / take) || 1,
        },
      };
    }
 
 // Obtener uno solo
  async findOne(id: number) {
    const productRepo = await this.getRepository(Product);
    
    const producto = await productRepo.findOne({
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

      // Actualiza los datos del producto principal
      queryRunner.manager.merge(Product, producto, productData);

      // 🛡️ BLINDAJE DE SERIALES: Solo procesamos si el DTO incluyó explícitamente la propiedad 'serials'
      if (producto.isSerialized && serials !== undefined) {
        const serialesActuales = producto.seriales || [];
        const serialesNuevosStr = [
          ...new Set(
            serials
              .map((s) => String(s).trim().toUpperCase())
              .filter(Boolean),
          ),
        ];

        if (serialesNuevosStr.length !== serials.length) {
          throw new BadRequestException('La lista de seriales contiene duplicados.');
        }

        const serialesActualesStr = serialesActuales.map((s) =>
          s.serialNumber.trim().toUpperCase(),
        );

        // 1. Eliminar solo los que ya no vienen Y están disponibles
        const serialesAEliminar = serialesActuales.filter(
          (s) => 
            !serialesNuevosStr.includes(s.serialNumber.trim().toUpperCase()) &&
            s.status === SerialStatus.DISPONIBLE
        );

        if (serialesAEliminar.length > 0) {
          await queryRunner.manager.remove(serialesAEliminar);
        }

        // 2. Crear nuevos seriales que no existían en este producto
        const serialesACrear = serialesNuevosStr
          .filter((s) => !serialesActualesStr.includes(s))
          .map((serialNumber) =>
            queryRunner.manager.create(ProductSerial, {
              productoId: id,
              serialNumber,
              status: SerialStatus.DISPONIBLE,
              almacen: productData.almacen ?? producto.almacen ?? 'Principal',
            }),
          );

        if (serialesACrear.length > 0) {
          const numerosDeSerialesACrear = serialesACrear.map((s) => s.serialNumber);
          
          // Verificar duplicados globales en otros productos
          const serialesGlobalesExistentes = await queryRunner.manager
            .getRepository(ProductSerial)
            .createQueryBuilder('serial')
            .where('UPPER(TRIM(serial.serialNumber)) IN (:...serials)', { serials: numerosDeSerialesACrear })
            .andWhere('serial.productoId != :id', { id })
            .getMany();

          if (serialesGlobalesExistentes.length > 0) {
            const serialDuplicado = serialesGlobalesExistentes[0].serialNumber;
            throw new BadRequestException(
              `La serie '${serialDuplicado}' ya está registrada en otro producto y no se puede repetir.`
            );
          }

          await queryRunner.manager.save(ProductSerial, serialesACrear);
        }

        // 3. Recalcular stock real
        const stockRealCalculado = await queryRunner.manager.count(ProductSerial, {
          where: {
            productoId: id,
            status: SerialStatus.DISPONIBLE,
          },
        });

        producto.stock = stockRealCalculado;
      }

      // Si no se mandó 'seriales' (viene undefined), simplemente limpiamos la propiedad temporalmente para que merge/save no falle
      delete (producto as any).seriales;

      // Lógica para productos NO serializados cuando cambian de almacén
      if (!producto.isSerialized && cambioDeAlmacen && producto.stock > 0) {
        const stockATransferir = Number(producto.stock);

        await queryRunner.manager.query(
          `UPDATE product_warehouse_stock SET cantidad = cantidad - $1 WHERE "productoId" = $2 AND almacen = $3`,
          [stockATransferir, id, almacenOriginal],
        );

        await queryRunner.manager.query(
          `INSERT INTO product_warehouse_stock ("productoId", almacen, cantidad) VALUES ($1, $2, $3)
          ON CONFLICT ("productoId", almacen) DO UPDATE SET cantidad = product_warehouse_stock.cantidad + $3`,
          [id, almacenNuevo, stockATransferir],
        );

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

      await queryRunner.manager.save(Product, producto);

      const productoConRelaciones = await queryRunner.manager.findOne(Product, {
        where: { id },
        relations: ['seriales'],
      });

      await queryRunner.commitTransaction();

      return productoConRelaciones;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  async remove(id: number) {
    const producto = await this.findOne(id);
    
    if (!producto.isActive) {
      throw new BadRequestException(`El producto con ID ${id} ya se encuentra inactivo.`);
    }

    // 🚀 Obtenemos el repositorio primero usando await
    const productRepo = await this.getRepository(Product);
    await productRepo.update(id, { isActive: false });
    
    return { ...producto, isActive: false };
  }

  async restore(id: number) {
    const producto = await this.findOne(id);
    
    if (producto.isActive) {
      throw new BadRequestException(`El producto con ID ${id} ya está activo.`);
    }

    producto.isActive = true;
    // 🚀 Obtenemos el repositorio primero usando await
    const productRepo = await this.getRepository(Product);
    return await productRepo.save(producto);
  }

  async getInventorySummary() {
    // 🚀 Obtenemos el repositorio primero usando await
    const productRepo = await this.getRepository(Product);

    const totalValueResult = await productRepo
      .createQueryBuilder('product')
      .select('SUM(product.stock * product.precio)', 'totalValue')
      .where('product.isActive = :isActive', { isActive: true })
      .getRawOne();

    const totalValue = parseFloat(totalValueResult.totalValue) || 0;

    const productsPerCategory = await productRepo
      .createQueryBuilder('product')
      .select('product.categoria', 'category')
      .addSelect('COUNT(product.id)', 'count')
      .where('product.isActive = :isActive', { isActive: true })
      .groupBy('product.categoria')
      .orderBy('count', 'DESC')
      .getRawMany();

    const totalsResult = await productRepo
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