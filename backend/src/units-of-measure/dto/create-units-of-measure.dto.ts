// 📄 src/units-of-measure/dto/create-units-of-measure.dto.ts
import { IsString, IsNotEmpty, IsBoolean, IsOptional, Length } from 'class-validator';

export class CreateUnitsOfMeasureDto {
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código es obligatorio' })
  @Length(1, 10, { message: 'El código debe tener entre 1 y 10 caracteres' })
  codigo: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  @IsOptional()
  activo?: boolean;
}