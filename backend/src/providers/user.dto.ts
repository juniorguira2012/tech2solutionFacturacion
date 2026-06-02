import { IsString, IsEmail, IsOptional, IsBoolean, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  rol: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string; // Opcional para actualizar, ya que no siempre se cambia

  @IsString()
  @IsOptional()
  rol?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}