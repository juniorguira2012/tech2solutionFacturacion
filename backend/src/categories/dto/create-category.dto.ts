import { IsString, IsNotEmpty, IsHexColor, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsHexColor()
  @IsOptional()
  color?: string;
}