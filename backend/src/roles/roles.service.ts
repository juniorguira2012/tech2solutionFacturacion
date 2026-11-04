import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import type { Request } from 'express'; // 👈 Corrección aplicada aquí

@Injectable({ scope: Scope.REQUEST })
export class RolesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSource: DataSource,
  ) {}

  private getActiveDataSource(): DataSource {
    return this.request['tenantDataSource'] || this.dataSource;
  }

  private async getRoleRepository(): Promise<Repository<Role>> {
    const tenantDataSource = this.getActiveDataSource();
    return tenantDataSource.getRepository(Role);
  }

  async findAll() {
    const roleRepository = await this.getRoleRepository();
    return await roleRepository.find();
  }

  async updateConfig(name: string, config: any) {
    const roleRepository = await this.getRoleRepository();
    
    let role = await roleRepository.findOne({ where: { name } });
    
    if (!role) {
      role = roleRepository.create({ name, config });
    } else {
      role.config = config;
    }
    
    return await roleRepository.save(role);
  }
}