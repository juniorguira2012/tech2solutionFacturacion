import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateComodatoDto {
  @IsNumber()
  productoId: number;

  @IsString()
  responsable: string;

  @IsOptional()
  @IsString()
  nota?: string;

  @IsOptional()
  @IsString()
  fechaEntrega?: string;

  @IsOptional()
  @IsDateString()
  fechaLimite?: string;

  @IsOptional()
  @IsNumber()
  usuarioId?: number;

  @IsOptional()
  @IsString()
  estado?: string;
}
