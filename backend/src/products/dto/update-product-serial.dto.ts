import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { SerialStatus } from '../entities/product-serial.entity';

export class UpdateProductSerialDto {
  @IsOptional()
  @IsString({ message: 'El número de serie debe ser una cadena de texto.' })
  @MinLength(1, { message: 'El número de serie no puede estar vacío.' })
  serialNumber?: string;

  @IsOptional()
  @IsEnum(SerialStatus, { message: 'El estado proporcionado no es válido.' })
  status?: SerialStatus;
}