import { Inject, Injectable, ConflictException, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource, Repository } from 'typeorm';
import { UnidadMedida } from './entities/units-of-measure.entity'; // Ajusta la ruta a tu entidad si es necesario
import { CreateUnitsOfMeasureDto } from './dto/create-units-of-measure.dto';
import { UpdateUnitsOfMeasureDto } from './dto/update-units-of-measure.dto';
import { getTenantDataSource } from '../tenants/tenant.middleware';

@Injectable({ scope: Scope.REQUEST })
export class UnitsOfMeasureService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSource: DataSource,
  ) {}

  private get repository(): Repository<UnidadMedida> {
    return getTenantDataSource(this.request).getRepository(UnidadMedida);
  }

  async create(createDto: CreateUnitsOfMeasureDto) {
    // Validamos si ya existe el código para evitar choques feos en Postgres
    const existe = await this.repository.findOne({ where: { codigo: createDto.codigo } });
    if (existe) {
      throw new ConflictException(`El código de unidad '${createDto.codigo}' ya está registrado.`);
    }

    const nuevaUnidad = this.repository.create(createDto);
    return await this.repository.save(nuevaUnidad);
  }

  async findAll() {
    // Retorna todas las unidades ordenadas por nombre
    return await this.repository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const unidad = await this.repository.findOne({ where: { id } });
    if (!unidad) {
      throw new NotFoundException(`Unidad de medida con ID ${id} no encontrada.`);
    }
    return unidad;
  }

  async update(id: number, updateDto: UpdateUnitsOfMeasureDto) {
    const unidad = await this.findOne(id);
    
    // Fusionamos los cambios del DTO con la entidad existente
    const editada = this.repository.merge(unidad, updateDto);
    return await this.repository.save(editada);
  }

  async remove(id: number) {
    const unidad = await this.findOne(id);
    // Borrado físico de la base de datos
    await this.repository.remove(unidad);
    return { deleted: true, id };
  }
}