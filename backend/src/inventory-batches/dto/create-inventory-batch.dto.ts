import { IsInt, IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateInventoryBatchDto {
  @IsInt()
  productoId: number;

  @IsString()
  numeroLote: string;

  @IsNumber()
  cantidad: number;

  @IsString()
  almacen: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: Date;
}