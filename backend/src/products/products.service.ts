import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Provider } from '../providers/provider.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  // Crear un producto
  async create(createProductDto: CreateProductDto) {
    if (createProductDto.proveedorId) {
      const provider = await this.providerRepository.findOneBy({ id: createProductDto.proveedorId });
      if (!provider) {
        throw new NotFoundException(`Proveedor con ID ${createProductDto.proveedorId} no encontrado.`);
      }
    }
    const nuevoProducto = this.productRepository.create(createProductDto); // `proveedorId` en DTO es suficiente
    return await this.productRepository.save(nuevoProducto);
  }

  // Obtener todos los productos (Lo que usará tu tabla de Inventario)
  async findAll(isActive: boolean | 'all' = true) {
    if (isActive === 'all') {
      return await this.productRepository.find({
        order: { id: 'DESC' },
      });
    }
    return await this.productRepository.find({
      where: { isActive }, // Usar el parámetro recibido
      order: { id: 'DESC' }, // Los más nuevos primero
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
  if (updateProductDto.proveedorId !== undefined && updateProductDto.proveedorId !== null) {
    const provider = await this.providerRepository.findOneBy({ id: updateProductDto.proveedorId });
    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${updateProductDto.proveedorId} no encontrado.`);
    }
  }

  const producto = await this.productRepository.preload({
    id: id,
    ...updateProductDto, // El DTO sobrescribe los valores, pero el ID manda
  });

  if (!producto)
    throw new NotFoundException(`No se pudo actualizar: ID ${id} no existe`);

  try {
    return await this.productRepository.save(producto);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error("Error en DB:", message);
    throw new BadRequestException(`Error de persistencia: ${message}`);
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
