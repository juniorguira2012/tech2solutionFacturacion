import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findOneBy({
      nombre: createCategoryDto.nombre,
    });
    if (existing) {
      throw new ConflictException('La categoría ya existe');
    }
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { nombre: 'ASC' } });
  }

  async remove(id: number): Promise<{ message: string }> {
    const categoriaAEliminar = await this.categoryRepository.findOneBy({ id });
    if (!categoriaAEliminar) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    const productosEnUso = await this.productRepository.count({
      where: { categoria: categoriaAEliminar.nombre },
    });
    if (productosEnUso > 0) {
      throw new ConflictException(`No se puede eliminar. La categoría "${categoriaAEliminar.nombre}" está en uso por ${productosEnUso} producto(s).`);
    }
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return { message: `Categoría con ID ${id} eliminada` };
  }
}