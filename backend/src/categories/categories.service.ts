import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource, Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { getTenantDataSource } from '../tenants/tenant.middleware';

@Injectable({ scope: Scope.REQUEST })
export class CategoriesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSource: DataSource,
  ) {}

  private get repository(): Repository<Category> {
    return getTenantDataSource(this.request).getRepository(Category);
  }

  create(createCategoryDto: CreateCategoryDto) {
    const category = this.repository.create(createCategoryDto);
    return this.repository.save(category);
  }

  findAll() {
    return this.repository.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const category = await this.repository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.repository.update(id, updateCategoryDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    await this.repository.remove(category);
    return { message: `Categoría "${category.nombre}" eliminada con éxito.` };
  }
}