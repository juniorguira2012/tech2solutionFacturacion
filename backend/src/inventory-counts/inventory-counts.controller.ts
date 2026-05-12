import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  Inject,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

// DTOs
export class CreateInventoryCountDto {
  @IsString()
  almacen: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class AddCountItemDto {
  @IsString()
  productoId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cantidadContada?: number;
}

export class UpdateCountItemDto {
  @IsNumber()
  @Min(0)
  cantidadContada: number;
}

// Guard placeholder (usuario debe crear este archivo)
// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// @Injectable()
// export class InventoryWriteGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest();
//     const userRole = request.headers['x-user-role'];
//     const permission = request.headers['x-inventory-permission'];
//     return permission === 'full' || permission === 'view';
//   }
// }

@Controller('inventory-counts')
export class InventoryCountsController {
  constructor(
    @Inject('InventoryCountsService') private readonly service: any,
  ) {}

  /**
   * Crear nuevo conteo de inventario
   * Solo usuarios con permiso 'full' pueden crear
   */
  @Post()
  @UseGuards(null) // Aplicar InventoryWriteGuard cuando esté disponible
  async createInventoryCount(
    @Body() dto: CreateInventoryCountDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Headers('x-inventory-permission') permission: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Usuario no identificado');
    }

    if (permission !== 'full') {
      throw new UnauthorizedException(
        'Solo usuarios con permiso "full" pueden crear conteos',
      );
    }

    return this.service.create({
      ...dto,
      usuarioId: userId,
      usuarioRole: userRole,
    });
  }

  /**
   * Listar conteos de inventario
   * Soporta filtrado por almacén
   */
  @Get()
  async listInventoryCounts(
    @Query('almacen') almacen?: string,
    @Headers('x-inventory-permission') permission?: string,
  ) {
    if (!permission || (permission !== 'full' && permission !== 'view')) {
      throw new UnauthorizedException(
        'No tienes permiso para acceder a los conteos',
      );
    }

    return this.service.findAll({ almacen });
  }

  /**
   * Obtener detalle de un conteo
   */
  @Get(':id')
  async getInventoryCount(
    @Param('id') id: string,
    @Headers('x-inventory-permission') permission?: string,
  ) {
    if (!permission || (permission !== 'full' && permission !== 'view')) {
      throw new UnauthorizedException(
        'No tienes permiso para acceder a este conteo',
      );
    }

    return this.service.findById(id);
  }

  /**
   * Agregar producto al conteo
   * Solo usuarios con permiso 'full' pueden agregar items
   */
  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  async addCountItem(
    @Param('id') id: string,
    @Body() dto: AddCountItemDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-inventory-permission') permission: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Usuario no identificado');
    }

    if (permission !== 'full') {
      throw new UnauthorizedException(
        'Solo usuarios con permiso "full" pueden agregar items al conteo',
      );
    }

    return this.service.addItem(id, dto, userId);
  }

  /**
   * Actualizar cantidad contada de un item
   * Solo usuarios con permiso 'full' pueden actualizar
   */
  @Patch(':id/items/:itemId')
  async updateCountItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCountItemDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-inventory-permission') permission: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Usuario no identificado');
    }

    if (permission !== 'full') {
      throw new UnauthorizedException(
        'Solo usuarios con permiso "full" pueden actualizar items',
      );
    }

    if (typeof dto.cantidadContada !== 'number' || dto.cantidadContada < 0) {
      throw new BadRequestException('La cantidad debe ser un número no negativo');
    }

    return this.service.updateItem(id, itemId, dto, userId);
  }

  /**
   * Publicar ajustes del conteo
   * Solo usuarios con permiso 'full' pueden publicar
   */
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publishInventoryCount(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-inventory-permission') permission: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Usuario no identificado');
    }

    if (permission !== 'full') {
      throw new UnauthorizedException(
        'Solo usuarios con permiso "full" pueden publicar conteos',
      );
    }

    return this.service.publish(id, userId);
  }

  /**
   * Cancelar conteo
   * Solo usuarios con permiso 'full' pueden cancelar
   */
  @Patch(':id/cancel')
  async cancelInventoryCount(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-inventory-permission') permission: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Usuario no identificado');
    }

    if (permission !== 'full') {
      throw new UnauthorizedException(
        'Solo usuarios con permiso "full" pueden cancelar conteos',
      );
    }

    return this.service.cancel(id, userId);
  }
}
