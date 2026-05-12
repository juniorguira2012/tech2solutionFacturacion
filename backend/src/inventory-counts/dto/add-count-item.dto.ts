import { IsNumber, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCountItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productoId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cantidadContada?: number;
}
