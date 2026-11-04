import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
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
    const { name, subdomain, adminEmail } = createTenantDto;
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
    const savedTenant = await this.tenantRepository.save(tenant);

    try {
      await this.createTenantDatabase(dbName);
      await this.initializeTenantSchema(dbName);
    } catch (error) {
      throw new InternalServerErrorException(`Error al aprovisionar la base de datos del tenant: ${error.message}`);
    }

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

      if (dbExists.length === 0) {
        await queryRunner.query(`CREATE DATABASE "${sanitizedDbName}";`);
      }
    } finally {
      await queryRunner.release();
    }
  }

  private async initializeTenantSchema(dbName: string) {
    const mainOptions = this.dataSource.options as any;
    
    const tenantDataSource = new DataSource({
      ...mainOptions,
      database: dbName,
      name: `provision_${dbName}_${Date.now()}`,
      synchronize: true,
      migrationsRun: false,
    });
    
    await tenantDataSource.initialize();
    await tenantDataSource.destroy();
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

    if (updateData.subdomain && updateData.subdomain !== tenant.subdomain) {
      const existing = await this.tenantRepository.findOne({
        where: { subdomain: updateData.subdomain },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException('El subdominio ya está en uso por otro tenant.');
      }
      tenant.subdomain = updateData.subdomain;
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