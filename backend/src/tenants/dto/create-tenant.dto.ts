import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateTenantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  subdomain: string;

  // 👈 Añade esta propiedad aquí para que el DTO la permita y valide
  @IsNotEmpty()
  @IsEmail()
  adminEmail: string;

  @IsNotEmpty()
  @IsString()
  adminPassword: string;
}