import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthController } from './auth.controller';
import { EmailService } from './email.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, EmailService],
  controllers: [UsersController, AuthController],
  exports: [UsersService],
})
export class UsersModule {}