import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateComodatoDto {
  @IsNumber()
  productoId: number;

  @IsString()
  responsable: string;

  @IsOptional()
  @IsString()
  nota?: string;

  @IsOptional()
  @IsNumber()
  usuarioId?: number;

  @IsOptional()
  @IsString()
  estado?: string;
}
