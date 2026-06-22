import { IsEnum, IsNotEmpty } from 'class-validator';
import { SerialStatus } from '../entities/product-serial.entity';

export class UpdateProductSerialDto {
  @IsNotEmpty({ message: 'El estado no puede estar vacío.' })
  @IsEnum(SerialStatus, { message: 'El estado proporcionado no es válido.' })
  status: SerialStatus;
}