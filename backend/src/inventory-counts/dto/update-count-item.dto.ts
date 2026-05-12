import { IsNumber, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCountItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cantidadContada: number;
}
