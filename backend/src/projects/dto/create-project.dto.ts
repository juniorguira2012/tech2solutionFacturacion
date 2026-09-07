import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  cliente?: string;

  @IsOptional()
  @IsString()
  zona?: string;

  @IsOptional()
  @IsIn(['planificado', 'en_ejecucion', 'pausado', 'completado', 'cancelado'])
  estado?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  presupuesto?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  inversion?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  kilometrosPlanificados?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  kilometrosInstalados?: number;

  @IsOptional()
  @IsString()
  tipoFibra?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidadFibraPlanificada?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidadFibraUsada?: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
