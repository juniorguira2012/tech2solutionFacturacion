import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class BulkMovementItemDto {
  @IsInt()
  productoId: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidad?: number;

  @IsOptional()
  @IsString()
  almacen?: string;

  @IsOptional()
  @IsString()
  lote?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serials?: string[];
}

export class CreateBulkMovementDto {
  @IsString()
  tipo: string;

  @IsString()
  nota: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkMovementItemDto)
  items: BulkMovementItemDto[];

  @IsOptional()
  @IsInt()
  usuarioId?: number;

  @IsOptional()
  @IsString()
  referencia?: string;
}