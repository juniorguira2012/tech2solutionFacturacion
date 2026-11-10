import { Body, Controller, Post, UnauthorizedException, BadRequestException, Headers, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../user/users.service';
import { EmailService } from './email.service';
import { ResetPasswordDto } from '../user/dto/user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { getTenantDataSource, type TenantRequest } from '../tenants/tenant.middleware';
import { DataSource } from 'typeorm';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    // Inicializamos el cliente de Google en el constructor
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }
  private googleClient: OAuth2Client;

  @Post('login')
  async login(@Body() body: any, @Req() request: TenantRequest) {
  
    
    const tenantDataSource = getTenantDataSource(request);
    const user = await this.usersService.findByEmail(body.email, tenantDataSource);

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
      this.configService.getOrThrow<string>('JWT_SECRET'), // 💡 CORRECCIÓN: Usamos ConfigService para consistencia
      { expiresIn: '7d' } //Aumentado de 1 día a 7 días
    );

    return {
      message: 'Login exitoso',
      user: userWithoutPassword,
      access_token: tokenGenerado, // 👈 ¡Pasaporte emitido con éxito!
    };
  }

  @Post('google-login')
  async googleLogin(@Body('token') token: string, @Req() request: TenantRequest) {
    try {
      if (!token) {
        throw new UnauthorizedException('Token de Google requerido.');
      }

      // useGoogleLogin entrega un access_token, no un id_token.
      const tokenInfo = await this.googleClient.getTokenInfo(token);
      const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const googlePayload = await googleResponse.json();

      if (!googleResponse.ok || !googlePayload?.email || !tokenInfo) {
        throw new UnauthorizedException('Token de Google inválido o sin email.');
      }

      // 2. Buscar o crear el usuario en nuestra DB
      const tenantDataSource = getTenantDataSource(request);
      let user = await this.usersService.findByEmail(googlePayload.email, tenantDataSource);

      if (!user) {
        // Si no existe, lo creamos con datos de Google
        user = await this.usersService.create({
          email: googlePayload.email,
          nombre: googlePayload.name ?? googlePayload.email?.split('@')[0] ?? 'Usuario Google',
          password: `google_${Date.now()}`, // Contraseña aleatoria, no se usará
          rol: 'vendedor', // Rol por defecto para nuevos usuarios
          isActive: true,
        }, tenantDataSource);
      }

      if (user.isActive === false) {
        throw new UnauthorizedException('Tu cuenta ha sido suspendida por un administrador.');
      }

      // 3. Generar nuestro propio JWT para la sesión
      const localPayload = { id: user.id, email: user.email, rol: user.rol };
      const accessToken = jwt.sign(
        localPayload,
        this.configService.getOrThrow<string>('JWT_SECRET'),
        { expiresIn: '7d' }, // 💡 Aumentado de 1 día a 7 días
      );

      const { password, ...userWithoutPassword } = user;

      return {
        message: 'Login con Google exitoso',
        user: userWithoutPassword,
        access_token: accessToken,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException('Falló la autenticación con Google: ' + message);
    }
  }

  @Post('validate-token')
  async validateToken(
    @Headers('authorization') authHeader: string,
    @Req() request: TenantRequest,
  ) {
    // 1. Verificamos que el header exista y tenga el formato Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No se ha proporcionado un token de acceso válido');
    }

    const token = authHeader.split(' ')[1];

    try {
      // 2. Verificamos el token nativamente usando la clave JWT_SECRET
      const secret = this.configService.getOrThrow<string>('JWT_SECRET');
      const payload = jwt.verify(token, secret) as any;

      // 3. Buscamos al usuario en la base de datos para verificar que siga existiendo y esté activo
      const user = await this.usersService.findByEmail(payload.email, getTenantDataSource(request));

      if (!user) {
        throw new UnauthorizedException('El usuario ya no existe en el sistema');
      }

      if (user.isActive === false) {
        throw new UnauthorizedException('Tu cuenta ha sido suspendida por un administrador');
      }

      // Separamos la contraseña por seguridad
      const { password, ...userWithoutPassword } = user;

      // 🌟 Retornamos un 200 con éxito y el usuario fresco de la base de datos
      return {
        success: true,
        message: 'Token válido',
        user: userWithoutPassword,
      };
    } catch (error) {
      // 🚨 CUALQUIER fallo (token expirado, alterado, etc.) devuelve un 401 limpio en vez de un Crash 500
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException('Token inválido o expirado: ' + message);
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string, @Req() request: TenantRequest) {
    if (!email) {
      throw new BadRequestException('El correo es requerido');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const token = await this.usersService.generateResetToken(normalizedEmail, getTenantDataSource(request));
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5174');
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
    await this.emailService.sendResetPasswordEmail(normalizedEmail, resetUrl);

    return {
      message: 'Si el correo existe, se envió un enlace para restablecer la contraseña.',
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto, @Req() request: TenantRequest) {
    await this.usersService.resetPassword(body.token, body.password, getTenantDataSource(request));
    return { message: 'Contraseña actualizada correctamente' };
  }
}