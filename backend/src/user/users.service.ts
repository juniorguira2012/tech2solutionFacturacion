import { Injectable, NotFoundException, BadRequestException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './dto/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private getRepository(dataSource?: DataSource): Repository<User> {
    return dataSource ? dataSource.getRepository(User) : this.usersRepository;
  }

  async onModuleInit() {
    // Creamos un usuario inicial para pruebas si la base de datos está vacía o el correo no existe
    const adminEmail = 'techtwosolution2@gmail.com'; // El correo de tu Gmail de pruebas

    // Agregamos un pequeño delay y try-catch para evitar crash si la tabla no existe aún
    setTimeout(async () => {
      try {
        const user = await this.findByEmail(adminEmail);
        if (!user) {
         // console.log('--- SEEDING: Creando usuario administrador de pruebas ---');
          await this.create({
            nombre: 'Admin Test',
            email: adminEmail,
            password: 'admin123456',
            rol: 'admin',
            isActive: true,
          });
        }
      } catch (error) {
        console.warn('--- SEEDING SKIPPED: La tabla "users" no existe todavía o la DB no está lista ---');
      }
    }, 5000);
  }

  // Método auxiliar para generar un hash rápido si necesitas actualizar la DB manualmente
  async getHash(password: string) {
    return await bcrypt.hash(password, 10);
  }

  findAll(dataSource?: DataSource): Promise<User[]> {
    // No seleccionamos el password para el listado general por seguridad
    return this.getRepository(dataSource).find({
      select: ['id', 'nombre', 'email', 'rol', 'isActive', 'createdAt']
    });
  }

  async findOne(id: number, dataSource?: DataSource): Promise<User | null> {
    return this.getRepository(dataSource).findOne({
      where: { id },
      select: ['id', 'nombre', 'email', 'rol', 'isActive']
    });
  }

  async remove(id: number, dataSource?: DataSource): Promise<User> {
    const usersRepository = this.getRepository(dataSource);
    const user = await usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    user.isActive = false;
    return usersRepository.save(user);
  }

  async create(createUserDto: CreateUserDto, dataSource?: DataSource): Promise<User> {
    const usersRepository = this.getRepository(dataSource);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const email = createUserDto.email.trim().toLowerCase();

    const existingUser = await usersRepository.findOne({
      where: { email },
    });

    if (existingUser?.isActive) {
      throw new ConflictException('Ya existe un usuario activo con este correo');
    }

    if (existingUser) {
      existingUser.nombre = createUserDto.nombre;
      existingUser.password = hashedPassword;
      existingUser.rol = createUserDto.rol;
      existingUser.isActive = createUserDto.isActive ?? true;

      const restoredUser = await usersRepository.save(existingUser);
      delete (restoredUser as Partial<User>).password;
      return restoredUser;
    }
    
    const newUser = usersRepository.create({
      ...createUserDto,
      email,
      password: hashedPassword,
    });
    
    const savedUser = await usersRepository.save(newUser);
    delete (savedUser as Partial<User>).password;
    return savedUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto, dataSource?: DataSource): Promise<User> {
    const usersRepository = this.getRepository(dataSource);
    // Si se está actualizando el password, hay que encriptarlo
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const user = await usersRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const savedUser = await usersRepository.save(user);
    delete (savedUser as Partial<User>).password;
    return savedUser;
  }

  async findByEmail(email: string, dataSource?: DataSource) {
    return this.getRepository(dataSource).findOne({
      where: { email: email.trim().toLowerCase() },
      select: ['id', 'nombre', 'email', 'password', 'rol', 'isActive'],
    });
  }

  async generateResetToken(email: string, dataSource?: DataSource) {
    const usersRepository = this.getRepository(dataSource);
    const user = await usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuario no registrado');
    }

    user.resetToken = crypto.randomBytes(32).toString('hex');
    user.resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await usersRepository.save(user);
    return user.resetToken;
  }

  async findByResetToken(token: string, dataSource?: DataSource) {
    return this.getRepository(dataSource)
      .createQueryBuilder('user')
      .addSelect(['user.resetToken', 'user.resetTokenExpiresAt'])
      .where('user.resetToken = :token', { token })
      .getOne();
  }

  async resetPassword(token: string, password: string, dataSource?: DataSource) {
    if (!token || !password) {
      throw new BadRequestException('Token y nueva contraseña requeridos');
    }

    const user = await this.findByResetToken(token, dataSource);
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

    await this.getRepository(dataSource).save(user);
  }
}
