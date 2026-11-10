import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { User } from '../user/dto/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private dataSource: DataSource,
  ) {}

  async findAll() {
    const tenants = await this.tenantRepository.find({ order: { createdAt: 'DESC' } });

    const enrichedTenants = await Promise.all(
      tenants.map(async (tenant) => {
        if (tenant.email) {
          return tenant;
        }

        if (!tenant.dbName) {
          return tenant;
        }

        const mainOptions = this.dataSource.options as any;
        const tenantDataSource = new DataSource({
          ...mainOptions,
          database: tenant.dbName,
          name: `fallback_email_${tenant.dbName}_${Date.now()}`,
          synchronize: false,
        });

        try {
          await tenantDataSource.initialize();
          const users = await tenantDataSource.query(
            `SELECT "email" FROM "users" WHERE "rol" = 'admin' LIMIT 1`
          );
          
          if (users && users.length > 0) {
            tenant.email = users[0].email;
          } else {
            tenant.email = 'No disponible';
          }
        } catch (error) {
          tenant.email = 'Error al consultar BD';
        } finally {
          if (tenantDataSource.isInitialized) {
            await tenantDataSource.destroy();
          }
        }

        return tenant;
      })
    );

    return enrichedTenants;
  }

  async findOne(id: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant con ID ${id} no encontrado.`);
    }
    return tenant;
  }

  async create(createTenantDto: CreateTenantDto) {
    const { name, adminEmail, adminPassword } = createTenantDto;
    const subdomain = createTenantDto.subdomain.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subdomain)) {
      throw new BadRequestException('El subdominio solo puede contener letras, números y guiones.');
    }
    const dbName = `${subdomain.replace(/-/g, '_')}_db`;

    const existing = await this.tenantRepository.findOne({
      where: [{ subdomain }, { dbName }],
    });

    if (existing) {
      throw new BadRequestException('El subdominio o la base de datos ya están registrados en el sistema.');
    }

    const tenant = this.tenantRepository.create({
      name,
      subdomain,
      dbName,
      email: adminEmail,
      isActive: true,
    });
    try {
      await this.createTenantDatabase(dbName);
      await this.initializeTenantSchema(dbName, adminEmail, adminPassword);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Error al aprovisionar la base de datos del tenant: ${message}`);
    }

    const savedTenant = await this.tenantRepository.save(tenant);

    return {
      message: `Tenant '${name}' creado y base de datos '${dbName}' inicializada exitosamente.`,
      tenant: savedTenant,
    };
  }

  private async createTenantDatabase(dbName: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const sanitizedDbName = dbName.replace(/[^a-zA-Z0-9_]/g, '');
      const dbExists = await queryRunner.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [sanitizedDbName],
      );

      if (dbExists.length > 0) {
        throw new BadRequestException(`La base de datos '${sanitizedDbName}' ya existe y no se reutilizará para un tenant nuevo.`);
      }
      await queryRunner.query(`CREATE DATABASE "${sanitizedDbName}";`);
    } finally {
      await queryRunner.release();
    }
  }

  private async initializeTenantSchema(dbName: string, adminEmail: string, adminPassword: string) {
    const mainOptions = this.dataSource.options as any;
    
    const tenantDataSource = new DataSource({
      ...mainOptions,
      database: dbName,
      name: `provision_${dbName}_${Date.now()}`,
      synchronize: true,
      migrationsRun: false,
    });
    
    await tenantDataSource.initialize();

    try {
      // 🌱 SEED AUTOMÁTICO DEL USUARIO ADMINISTRADOR INICIAL
      const userRepository = tenantDataSource.getRepository(User);
      
      const existingAdmin = await userRepository.findOne({ where: { rol: 'admin' } });
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        await userRepository.save({
          nombre: 'Administrador General',
          email: adminEmail.trim().toLowerCase(),
          password: hashedPassword,
          rol: 'admin',
          isActive: true,
        });
        
        console.log(`✅ Usuario administrador sembrado con éxito en la BD: ${dbName} (${adminEmail})`);
      }
    } catch (seedError) {
      const message = seedError instanceof Error ? seedError.message : String(seedError);
      console.error('⚠️ No se pudo sembrar el usuario admin inicial:', message);
      throw seedError;
    } finally {
      await tenantDataSource.destroy();
    }
  }

  async updateStatus(id: string, isActive: boolean) {
    const tenant = await this.findOne(id);
    tenant.isActive = isActive;
    await this.tenantRepository.save(tenant);
    return {
      message: `El tenant '${tenant.name}' ahora está ${isActive ? 'ACTIVO' : 'SUSPENDIDO'}.`,
      tenant,
    };
  }

 // Actualizar información general del tenant (Nombre, Subdominio y Correo)
  async update(id: string, updateData: { name?: string; subdomain?: string; email?: string }) {
    const tenant = await this.findOne(id);

    if (updateData.name) {
      tenant.name = updateData.name;
    }

    if (updateData.email) {
      tenant.email = updateData.email;

      // Opcional pero recomendado: Actualizar también el correo del usuario admin dentro de la BD propia del tenant
      if (tenant.dbName) {
        const mainOptions = this.dataSource.options as any;
        const tenantDataSource = new DataSource({
          ...mainOptions,
          database: tenant.dbName,
          name: `update_email_${tenant.dbName}_${Date.now()}`,
          synchronize: false,
        });

        try {
          await tenantDataSource.initialize();
          await tenantDataSource.query(
            `UPDATE "users" SET "email" = $1 WHERE "rol" = 'admin'`,
            [updateData.email]
          );
        } catch (error) {
          console.error('No se pudo actualizar el correo en la BD del tenant:', error.message);
        } finally {
          if (tenantDataSource.isInitialized) {
            await tenantDataSource.destroy();
          }
        }
      }
    }

    const subdomain = updateData.subdomain?.trim().toLowerCase();
    if (subdomain && subdomain !== tenant.subdomain) {
      const existing = await this.tenantRepository.findOne({
        where: { subdomain },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException('El subdominio ya está en uso por otro tenant.');
      }
      tenant.subdomain = subdomain;
    }

    const updatedTenant = await this.tenantRepository.save(tenant);
    return {
      message: 'Tenant actualizado exitosamente.',
      tenant: updatedTenant,
    };
  }

  async resetPassword(id: string, newPassword: string) {
    const tenant = await this.findOne(id);

    if (!tenant.dbName) {
      throw new BadRequestException('Este tenant no tiene una base de datos asignada.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const mainOptions = this.dataSource.options as any;
    const tenantDataSource = new DataSource({
      ...mainOptions,
      database: tenant.dbName,
      name: `reset_pass_${tenant.dbName}_${Date.now()}`,
      synchronize: false,
    });

    try {
      await tenantDataSource.initialize();

      await tenantDataSource.query(
        `UPDATE "users" SET "password" = $1 WHERE "rol" = 'admin'`,
        [hashedPassword]
      );

      return {
        message: `Contraseña del administrador actualizada con éxito para el tenant '${tenant.name}'.`,
      };
    } catch (error) {
      throw new InternalServerErrorException(`Error al conectar con la BD del tenant para actualizar la clave: ${error.message}`);
    } finally {
      if (tenantDataSource.isInitialized) {
        await tenantDataSource.destroy();
      }
    }
  }
}