import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class InventoryWriteGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
