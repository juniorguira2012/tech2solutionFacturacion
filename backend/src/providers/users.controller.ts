import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, Headers, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('login')
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
  
}