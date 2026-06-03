import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    // Lista de roles maestros definidos en el código
    const defaultRoles = [
      { 
        name: 'admin', 
        config: { modules: { ventas: 'full', inventario: 'full', reportes: 'full', clientes: 'full' }, viewScope: 'all' } 
      },
      { 
        name: 'supervisor', 
        config: { modules: { ventas: 'full', inventario: 'full', reportes: 'view', clientes: 'full' }, viewScope: 'all' } 
      },
      { 
        name: 'vendedor', 
        config: { modules: { ventas: 'full', inventario: 'none', reportes: 'none', clientes: 'full' }, viewScope: 'own' } 
      },
      { 
        name: 'cajero', 
        config: { modules: { ventas: 'full', inventario: 'none', reportes: 'none', clientes: 'none' }, viewScope: 'own' } 
      }
    ];

    setTimeout(async () => {
      try {
        for (const roleData of defaultRoles) {
          const exists = await this.rolesRepository.findOne({ where: { name: roleData.name } });
          
          if (!exists) {
            console.log(`--- SEEDING: Integrando rol faltante '${roleData.name}' en la base de datos ---`);
            await this.updateConfig(roleData.name, roleData.config);
          }
        }
      } catch (error) {
        console.warn('--- SEEDING ROLES SKIPPED: La base de datos no respondió a tiempo ---');
      }
    }, 7000); // Un poco más de delay que el de usuarios para asegurar orden
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { name } });
    if (!role) throw new NotFoundException(`Rol ${name} no configurado`);
    return role;
  }

  async remove(name: string): Promise<void> {
    const role = await this.findByName(name);
    if (name === 'admin') throw new Error('No se puede eliminar el rol de administrador');
    await this.rolesRepository.remove(role);
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