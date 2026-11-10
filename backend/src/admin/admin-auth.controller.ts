import { Controller, Post, Patch, Body } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';

@Controller('admin/auth')
export class AdminAuthController { // 👈 Asegúrate de que tenga la palabra 'export' aquí
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.adminAuthService.login(body.email, body.password);
  }

  @Patch('profile')
  async updateProfile(@Body() body: { id: string; name?: string; email?: string; newPassword?: string }) {
    return this.adminAuthService.updateProfile(body.id, body);
  }
}