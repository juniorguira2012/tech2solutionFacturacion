import { IsInt, IsIP, IsNotEmpty, IsString } from 'class-validator';

export class CreateLoginHistoryDto {
  @IsInt()
  userId: number;

  @IsString()
  @IsNotEmpty()
  userIdentifier: string;

  @IsIP()
  ipAddress: string;

  @IsString()
  userAgent: string;
}