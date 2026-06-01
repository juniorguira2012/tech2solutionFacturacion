import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.usersService.findByEmail(body.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.password !== body.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      message: 'Login exitoso',
      user,
    };
  }
}