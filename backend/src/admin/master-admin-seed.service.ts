import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterAdmin } from './entities/master-admin.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MasterAdminSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(MasterAdmin)
    private masterAdminRepo: Repository<MasterAdmin>,
  ) {}

  async onModuleInit() {
    const count = await this.masterAdminRepo.count();
    if (count === 0) {
      const defaultEmail = process.env.MASTER_ADMIN_EMAIL || 'techtwosolution2@gmail.com';
      const defaultPassword = process.env.MASTER_ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const admin = this.masterAdminRepo.create({
        name: 'Master Admin',
        email: defaultEmail,
        password: hashedPassword,
        rol: 'super_admin',
      });

      await this.masterAdminRepo.save(admin);
      console.log(`🔐 Master Admin inicializado en BD con el correo: ${defaultEmail}`);
    }

  }
  async updateProfile(adminId: string, updateDto: { name?: string; email?: string; newPassword?: string }) {
    // 1. Buscamos al Master Admin por su ID
    const admin = await this.masterAdminRepo.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Administrador no encontrado.');
    }

    // 2. Actualizamos nombre si viene en la petición
    if (updateDto.name) {
      admin.name = updateDto.name;
    }

    // 3. Actualizamos correo validando que no esté duplicado
    if (updateDto.email && updateDto.email !== admin.email) {
      const existing = await this.masterAdminRepo.findOne({ where: { email: updateDto.email } });
      if (existing) {
        throw new BadRequestException('El correo electrónico ya está en uso por otro usuario.');
      }
      admin.email = updateDto.email;
    }

    // 4. Si se envió una nueva contraseña, la ciframos con bcrypt
    if (updateDto.newPassword && updateDto.newPassword.trim() !== '') {
      admin.password = await bcrypt.hash(updateDto.newPassword, 10);
    }

    // 5. Guardamos los cambios en la base de datos
    const updatedAdmin = await this.masterAdminRepo.save(admin);

    return {
      message: 'Perfil de Super Admin actualizado correctamente.',
      admin: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        rol: updatedAdmin.rol,
      },
    };
  }
}