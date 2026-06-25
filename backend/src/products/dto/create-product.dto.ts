import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  IsEmail
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  serie?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  // 👇 AGREGA ESTE CAMPO AQUÍ PARA QUE EL BACKEND LO ACEPTE
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSerialized?: boolean;

  @IsOptional()
  @IsString()
  imagen?: string;

  @IsOptional()
  @IsString()
  almacen?: string;

  @IsOptional()
  @IsString()
  pasillo?: string;

  @IsOptional()
  @IsString()
  fila?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsString()
  unidadMedida?: string;

  @IsOptional()
  @IsString()
  movimientoInventario?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsArray()
  camposPersonalizados?: Array<Record<string, unknown>>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  vendidos?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean; 

  @IsOptional()
  @IsNumber()
  @IsPositive() 
  proveedorId?: number;

  @IsEmail()
  @IsOptional()
  correo?: string;

  @IsString()
  @IsOptional()
  nota?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serials?: string[];
}