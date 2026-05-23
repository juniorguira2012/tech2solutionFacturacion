import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { name } });
    if (!role) throw new NotFoundException(`Rol ${name} no configurado`);
    return role;
  }

  async updateConfig(name: string, config: any): Promise<Role> {
    let role = await this.rolesRepository.findOne({ where: { name } });
    
    if (!role) {
      role = this.rolesRepository.create({ name, config });
    } else {
      role.config = config;
    }

    return this.rolesRepository.save(role);
  }
}