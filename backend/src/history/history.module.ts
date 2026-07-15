import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginHistory } from './entities/login-history.entity';
import { LoginHistoryService } from './login-history.service';
import { HistoryController } from './history.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoginHistory]),
    // Usamos forwardRef para romper la dependencia circular entre AuthModule y HistoryModule
    // AuthModule necesita LoginHistoryService, y HistoryController necesita los guards de AuthModule.
   // forwardRef(() => AuthModule),
  ],
  providers: [LoginHistoryService],
  controllers: [HistoryController],
  exports: [LoginHistoryService],
})
export class HistoryModule {}