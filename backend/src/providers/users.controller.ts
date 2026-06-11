import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Headers, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto, @Headers('x-user-role') role: string) {
    if (role !== 'admin') throw new UnauthorizedException('Solo el administrador puede crear usuarios');
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Headers('x-user-role') role: string
  ) {
    if (role !== 'admin') throw new UnauthorizedException('Solo el administrador puede editar usuarios');
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-user-id') requestorId: string,
    @Headers('x-user-role') role: string
  ) {
    if (role !== 'admin') throw new UnauthorizedException('Permiso insuficiente');

    const targetUser = await this.usersService.findOne(id);
    if (!targetUser) throw new NotFoundException('Usuario no encontrado');

    const requestor = await this.usersService.findOne(Number(requestorId));
    if (!requestor) throw new UnauthorizedException('Solicitante no válido');

    // Regla de Oro: Solo el super usuario puede desactivar a otros administradores
    const SUPER_USER_EMAIL = 'techtwosolution2@gmail.com';
    
    if (targetUser.rol === 'admin' && requestor.email !== SUPER_USER_EMAIL) {
      throw new UnauthorizedException(`Solo el super usuario ${SUPER_USER_EMAIL} puede desactivar administradores`);
    }

    return this.usersService.remove(id);
  }

}
