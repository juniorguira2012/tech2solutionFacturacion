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
  Delete,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { InventoryCountsService } from './inventory-counts.service';

// DTOs
export class CreateInventoryCountDto {
  @IsString()
  almacen: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class AddCountItemDto {
  @Type(() => Number)
  @IsNumber()
  productoId: number;

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
    private readonly service: InventoryCountsService,
  ) {}

  /**
   * Crear nuevo conteo de inventario
   * Solo usuarios con permiso 'full' pueden crear
   */
  @Post()
  async createInventoryCount(
    @Body() dto: CreateInventoryCountDto,
    @Headers('x-user-id') userId: string | undefined, // Puede ser undefined si el header no se envía
    @Headers('x-user-role') userRole: string,
    @Headers('x-inventory-permission') permission: string,
  ) {
    if (permission !== 'full') {
      throw new UnauthorizedException(
        'Solo usuarios con permiso "full" pueden crear conteos',
      );
    }
    if (!userId) { // Verificamos que el userId exista
      throw new UnauthorizedException('Usuario no identificado');
    }

    return this.service.create({
      ...dto,
    }, { id: userId, rol: userRole });
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

    return this.service.findAll(almacen);
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

    return this.service.findOne(Number(id));
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
    @Headers('x-user-id') userId: string | undefined, // Puede ser undefined
    @Headers('x-inventory-permission') permission: string,
  ) {
    if (permission !== 'full') {
      throw new UnauthorizedException(
        'Solo usuarios con permiso "full" pueden agregar items al conteo',
      );
    }
    if (!userId) { // Verificamos que el userId exista
      throw new UnauthorizedException('Usuario no identificado');
    }

    return this.service.addProductToCount(Number(id), dto);
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
    @Headers('x-user-id') userId: string | undefined, // Puede ser undefined
    @Headers('x-inventory-permission') permission: string,
  ) {
    if (permission !== 'full') {
      throw new UnauthorizedException(
        'Solo usuarios con permiso "full" pueden actualizar items',
      );
    }
    if (!userId) { // Verificamos que el userId exista
      throw new UnauthorizedException('Usuario no identificado');
    }

    if (typeof dto.cantidadContada !== 'number' || dto.cantidadContada < 0) {
      throw new BadRequestException('La cantidad debe ser un número no negativo');
    }

    return this.service.updateCountItem(Number(id), Number(itemId), dto);
  }

  /**
   * Publicar ajustes del conteo
   * Solo usuarios con permiso 'full' pueden publicar
   */
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publishInventoryCount(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string | undefined, // Puede ser undefined
    @Headers('x-inventory-permission') permission: string,
  ) {
    if (permission !== 'full') {
      throw new UnauthorizedException(
        'Solo usuarios con permiso "full" pueden publicar conteos',
      );
    }
    if (!userId) { // Verificamos que el userId exista
      throw new UnauthorizedException('Usuario no identificado');
    }

    return this.service.publishAdjustments(Number(id));
  }

  /**
   * Cancelar conteo
   * Solo usuarios con permiso 'full' pueden cancelar
   */
  @Patch(':id/cancel')
  async cancelInventoryCount(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-inventory-permission') permission: string, // Este es el header de permiso, no el userId
  ) {
    if (permission !== 'full') {
      throw new UnauthorizedException(
        'Solo usuarios con permiso "full" pueden cancelar conteos',
      );
    }

    if (!userId) { // Verificamos que el userId exista
      throw new UnauthorizedException('Usuario no identificado');
    }
    return this.service.cancelCount(Number(id));
  }

  /**
   * Eliminar un conteo físico
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeInventoryCount(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Headers('x-inventory-permission') permission: string,
  ) {
    if (userRole !== 'admin' && permission !== 'full') {
      throw new UnauthorizedException('Solo administradores pueden eliminar auditorías físicas');
    }
    return this.service.remove(Number(id), userId);
  }
}
