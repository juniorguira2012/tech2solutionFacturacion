import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la categoría no puede estar vacío.' })
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}