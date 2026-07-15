import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './dto/entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from '../user/users.controller';
import { AuthController } from '../user/auth.controller';
import { EmailService } from './email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [UsersService, EmailService],
  controllers: [UsersController, AuthController],
  exports: [UsersService, JwtModule],
})
export class UsersModule {}