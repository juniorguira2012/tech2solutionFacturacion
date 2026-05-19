import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateMovementDto {
  @IsNumber()
  productoId: number;

  @IsString()
  tipo: string;

  @IsNumber()
  cantidad: number;

  @IsOptional()
  @IsString()
  nota?: string;

  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsString()
  almacenOrigen?: string;

  @IsOptional()
  @IsString()
  almacenDestino?: string;

  @IsOptional()
  @IsNumber()
  costoUnitario?: number;
}
