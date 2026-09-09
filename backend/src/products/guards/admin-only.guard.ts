import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    let user = request.user;

    if (!user && request.headers.authorization) {
      try {
        const token = request.headers.authorization.split(' ')[1];
        user = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      } catch {
        user = null;
      }
    }

    const tokenRole = user?.role || user?.rol?.nombre || user?.rol;
    const headerRole = request.headers['x-user-role'];
    if (String(tokenRole || headerRole).toLowerCase() === 'admin') return true;

    throw new ForbiddenException('Solo un administrador puede eliminar seriales.');
  }
}