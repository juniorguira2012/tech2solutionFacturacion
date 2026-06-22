import { IsArray, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AssignSerialsToTechnicianDto {
  @IsInt({ message: 'El ID del técnico debe ser un número.' })
  @IsNotEmpty({ message: 'Debe proporcionar un técnico.' })
  technicianId: number;

  @IsArray({ message: 'Los seriales deben ser un arreglo.' })
  @IsString({ each: true, message: 'Cada serial debe ser un texto.' })
  @IsNotEmpty({ each: true, message: 'No se permiten seriales vacíos.' })
  serials: string[];

  @IsInt()
  @IsNotEmpty()
  usuarioId: number;
}