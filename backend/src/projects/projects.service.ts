import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { getTenantDataSource } from '../tenants/tenant.middleware';

@Injectable({ scope: Scope.REQUEST })
export class ProjectsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSource: DataSource,
  ) {}

  private get projectRepository(): Repository<Project> {
    return getTenantDataSource(this.request).getRepository(Project);
  }

  findAll() {
    return this.projectRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Proyecto ${id} no encontrado`);
    return project;
  }

  create(dto: CreateProjectDto) {
    return this.projectRepository.save(this.projectRepository.create({
      estado: 'planificado',
      presupuesto: 0,
      inversion: 0,
      kilometrosPlanificados: 0,
      kilometrosInstalados: 0,
      cantidadFibraPlanificada: 0,
      cantidadFibraUsada: 0,
      ...dto,
    }));
  }

  async update(id: number, dto: UpdateProjectDto) {
    const project = await this.findOne(id);
    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  async remove(id: number) {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
    return { message: 'Proyecto eliminado correctamente' };
  }
}
