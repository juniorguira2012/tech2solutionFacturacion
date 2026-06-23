import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Provider } from '../providers/provider.entity';
import { ProductSerial, SerialStatus } from './entities/product-serial.entity';

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
      const { serials, ...productData } = createProductDto;

      if (productData.proveedorId) {
        const provider = await queryRunner.manager.findOneBy(Provider, { id: productData.proveedorId });
        if (!provider) {
          throw new NotFoundException(`Proveedor con ID ${productData.proveedorId} no encontrado.`);
        }
      }

      const nuevoProducto = queryRunner.manager.create(Product, productData);

      if (nuevoProducto.isSerialized && serials && serials.length > 0) {
        // Validar duplicados dentro de la misma lista antes de crear
        const uniqueSerials = [...new Set(serials)];
        if (uniqueSerials.length !== serials.length) {
          throw new BadRequestException('La lista contiene números de serie duplicados.');
        }

        nuevoProducto.seriales = uniqueSerials.map(serialNumber => { 
          const serialLimpio = serialNumber.trim();
          return queryRunner.manager.create(ProductSerial, {
            serialNumber: serialLimpio,
            status: SerialStatus.DISPONIBLE,
            almacen: nuevoProducto.almacen || 'Principal',
          });
        });
        // El stock se calcula en el frontend, pero lo re-aseguramos aquí
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

  // Obtener todos los productos (Lo que usará tu tabla de Inventario)
  async findAll(isActive: boolean | 'all' = true) {
    if (isActive === 'all') {
      return await this.productRepository.find({
        order: { createdAt: 'DESC' }, // Ordenar por fecha de creación descendente
      });
    }
    return await this.productRepository.find({
      where: { isActive }, // Usar el parámetro recibido
      order: { createdAt: 'DESC' }, // Los más nuevos primero
    });
  }

  // Obtener uno solo
  async findOne(id: number) {
    const producto = await this.productRepository.findOneBy({ id });
    if (!producto)
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
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

      if (producto.isSerialized) {
        const serialesActuales = producto.seriales || [];
        const serialesNuevos = serials ?? [];
        const serialesNuevosStr = [...new Set(serialesNuevos.map(s => String(s).trim()).filter(Boolean))];

        if (serials && serialesNuevosStr.length !== serials.length) {
          throw new BadRequestException('La lista de seriales contiene duplicados.');
        }

        const serialesActualesStr = serialesActuales.map(s => s.serialNumber);

        // 1. Identificar seriales a eliminar
        const serialesAEliminar = serialesActuales.filter(
          s => !serialesNuevosStr.includes(s.serialNumber),
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
        // Filtramos para ignorar los seriales que ya existen en la base de datos para este producto.
        // Esto evita errores de duplicados y permite añadir nuevos seriales a una lista existente sin problemas.
        const serialesACrear = serialesNuevosStr
          .filter(s => !serialesActualesStr.includes(s))
          .map(serialNumber => queryRunner.manager.create(ProductSerial, {
            productoId: id,
            serialNumber,
            status: SerialStatus.DISPONIBLE,
            // Usamos el almacén que viene en la actualización, o el que ya tenía el producto.
            almacen: productData.almacen ?? producto.almacen ?? 'Principal',
          }));

        // Solo intentamos guardar si realmente hay seriales nuevos que añadir.
        if (serialesACrear.length > 0) {
          await queryRunner.manager.save(ProductSerial, serialesACrear);
        }
        
        // Asignamos el nuevo stock basado en los seriales finales
        productData.stock = serialesNuevosStr.length;
      }

      // 3. Actualizar los datos del producto usando UPDATE plano para ignorar el 'cascade: true'
      await queryRunner.manager.update(Product, id, productData as any);

      await queryRunner.commitTransaction();

      // Retornamos el producto actualizado y refrescado
      return await this.productRepository.findOne({
        where: { id },
        relations: ['seriales'],
      });

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
}
