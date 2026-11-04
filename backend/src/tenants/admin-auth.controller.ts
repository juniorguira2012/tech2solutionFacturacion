import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';

@Controller('admin/auth')
export class AdminAuthController {
  
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // Aquí validas contra tus credenciales de Super Admin (pueden estar en variables de entorno .env)
    const MASTER_EMAIL = process.env.MASTER_ADMIN_EMAIL || 'admin@tech2solution.com';
    const MASTER_PASSWORD = process.env.MASTER_ADMIN_PASSWORD || 'admin123';

    if (body.email === MASTER_EMAIL && body.password === MASTER_PASSWORD) {
      return {
        access_token: 'master-super-secure-token-12345',
        user: {
          name: 'Master Admin',
          email: MASTER_EMAIL,
          rol: 'super_admin',
        },
      };
    }

    throw new UnauthorizedException('Credenciales de Master Admin incorrectas.');
  }
}