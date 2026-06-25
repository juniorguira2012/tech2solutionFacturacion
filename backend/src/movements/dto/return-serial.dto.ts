import { IsString, IsOptional } from 'class-validator';

export class ReturnSerialDto {
  @IsString()
  @IsOptional() // Lo volvemos opcional aquí...
  serialNumber?: string;

  @IsString()
  @IsOptional() // ...para permitir que también pueda venir bajo el nombre 'serial'
  serial?: string;

  @IsString()
  @IsOptional()
  nota?: string;
}