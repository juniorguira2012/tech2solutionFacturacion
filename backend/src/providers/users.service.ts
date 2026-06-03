import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Creamos un usuario inicial para pruebas si la base de datos está vacía o el correo no existe
    const adminEmail = 'techtwosolution2@gmail.com'; // El correo de tu Gmail de pruebas
    const user = await this.findByEmail(adminEmail);
    
    if (!user) {
      console.log('--- SEEDING: Creando usuario administrador de pruebas ---');
      await this.create({
        nombre: 'Admin Test',
        email: adminEmail,
        password: 'admin123456', // Se encriptará automáticamente en el método create
        rol: 'admin',
        isActive: true,
      });
    }
  }

  // Método auxiliar para generar un hash rápido si necesitas actualizar la DB manualmente
  async getHash(password: string) {
    return await bcrypt.hash(password, 10);
  }

  findAll(): Promise<User[]> {
    // No seleccionamos el password para el listado general por seguridad
    return this.usersRepository.find({
      select: ['id', 'nombre', 'email', 'rol', 'isActive', 'createdAt']
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: ['id', 'nombre', 'email', 'rol', 'isActive']
    });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    
    return this.usersRepository.save(newUser);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Si se está actualizando el password, hay que encriptarlo
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const user = await this.usersRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'nombre', 'email', 'password', 'rol', 'isActive'],
    });
  }

  async generateResetToken(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuario no registrado');
    }

    user.resetToken = crypto.randomBytes(32).toString('hex');
    user.resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.usersRepository.save(user);
    return user.resetToken;
  }

  async findByResetToken(token: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect(['user.resetToken', 'user.resetTokenExpiresAt'])
      .where('user.resetToken = :token', { token })
      .getOne();
  }

  async resetPassword(token: string, password: string) {
    if (!token || !password) {
      throw new BadRequestException('Token y nueva contraseña requeridos');
    }

    const user = await this.findByResetToken(token);
    if (!user) {
      throw new NotFoundException('Token inválido o expirado');
    }

    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('El token ha expirado');
    }

    // Aseguramos que usamos la variable 'password' que viene del DTO
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;

    await this.usersRepository.save(user);
  }
}