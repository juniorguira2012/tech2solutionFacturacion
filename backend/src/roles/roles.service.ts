import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll() {
    return await this.roleRepository.find();
  }

  async updateConfig(name: string, config: any) {
    let role = await this.roleRepository.findOne({ where: { name } });
    
    if (!role) {
      role = this.roleRepository.create({ name, config });
    } else {
      role.config = config;
    }
    
    return await this.roleRepository.save(role);
  }
}
