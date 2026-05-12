import { IsString, IsOptional } from 'class-validator';

export class CreateInventoryCountDto {
  @IsString()
  almacen: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
