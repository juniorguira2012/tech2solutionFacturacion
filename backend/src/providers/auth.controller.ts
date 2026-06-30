import { Body, Controller, Post, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { EmailService } from './email.service';
import { ResetPasswordDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.usersService.findByEmail(body.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('Usuario suspendido por administración');
    }

    // Comparación segura de hashes
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      message: 'Login exitoso',
      user,
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('El correo es requerido');
    }

    try {
      const token = await this.usersService.generateResetToken(email);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5174');
      const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
      await this.emailService.sendResetPasswordEmail(email, resetUrl);
    } catch (error) {
      Logger.error('Error en forgot-password', error as Error, AuthController.name);
    }

    return {
      message: 'Si el correo existe, se envió un enlace para restablecer la contraseña.',
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.usersService.resetPassword(body.token, body.password);
    return { message: 'Contraseña actualizada correctamente' };
  }
}
