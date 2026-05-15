import { IsString, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SaleItemDto {
  @IsNumber()
  productoId: number;

  @IsNumber()
  cantidad: number;

  @IsNumber()
  precio: number;
}

export class CreateSaleDto {
  @IsString()
  cliente: string;

  @IsOptional()
  @IsString()
  rnc?: string;

  @IsNumber()
  subtotal: number;

  @IsOptional()
  @IsNumber()
  descuento?: number;

  @IsNumber()
  itbis: number;

  @IsNumber()
  total: number;

  @IsOptional()
  @IsString()
  vendedorId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
