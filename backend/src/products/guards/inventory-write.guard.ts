import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class InventoryWriteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const role = request.headers['x-user-role'];
    const inventoryPermission = request.headers['x-inventory-permission'];

    if (role === 'admin' || inventoryPermission === 'full') {
      return true;
    }

    throw new ForbiddenException(
      'No tienes permiso para modificar el inventario',
    );
  }
}
