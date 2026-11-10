import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterAdmin } from './entities/master-admin.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(MasterAdmin)
    private masterAdminRepo: Repository<MasterAdmin>,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.masterAdminRepo.findOne({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Credenciales de Master Admin incorrectas.');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales de Master Admin incorrectas.');
    }

    return {
      access_token: 'master-super-secure-token-12345',
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        rol: admin.rol,
      },
    };
  }

 async updateProfile(adminId: string, updateDto: { name?: string; email?: string; newPassword?: string; password?: string }) {
  const admin = await this.masterAdminRepo.findOne({ where: { id: adminId } });
    if (!admin) {
        throw new NotFoundException('Administrador no encontrado.');
    }

    if (updateDto.name) {
        admin.name = updateDto.name;
    }

    if (updateDto.email && updateDto.email !== admin.email) {
        admin.email = updateDto.email;
    }

    // 👈 Capturamos cualquiera de las dos opciones que mande el frontend
    const passwordToUpdate = updateDto.newPassword || updateDto.password;

    if (passwordToUpdate && passwordToUpdate.trim() !== '') {
        admin.password = await bcrypt.hash(passwordToUpdate, 10);
    }

    const updatedAdmin = await this.masterAdminRepo.save(admin);

    return {
        message: 'Perfil actualizado correctamente.',
        admin: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        rol: updatedAdmin.rol,
        },
    };
  }
}