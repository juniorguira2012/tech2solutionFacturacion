import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ReturnSerialDto {
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsOptional()
  nota?: string;
}