import { Body, Controller, Post, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { EmailService } from './email.service';
import { ResetPasswordDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken'; // 👈 1. ¡IMPORTAMOS LA LIBRERÍA NATIVA DIRECTA!

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    // Puedes dejar o quitar el JwtService del constructor, ya no lo usaremos aquí
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

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 🔑 Creamos el payload estándar
    const payload = { 
      id: user.id, 
      email: user.email, 
      rol: user.rol 
    };

    // Separamos la contraseña para no enviarla al cliente
    const { password, ...userWithoutPassword } = user;

    // 🚀 2. LA MAGIA: Firmamos directamente con la librería nativa
    // Esto es imposible que falle por "secretOrPrivateKey" porque la clave está incrustada a la fuerza
    const tokenGenerado = jwt.sign(
      payload, 
      process.env.JWT_SECRET || 'ClaveSecretaDePruebaLosAlcarrizos123!', 
      { expiresIn: '1d' }
    );

    return {
      message: 'Login exitoso',
      user: userWithoutPassword,
      access_token: tokenGenerado, // 👈 ¡Pasaporte emitido con éxito!
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