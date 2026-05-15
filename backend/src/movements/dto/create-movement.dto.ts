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
}
