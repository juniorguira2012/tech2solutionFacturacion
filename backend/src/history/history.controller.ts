import { Controller, Get, UseGuards, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginHistoryService } from './login-history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly loginHistoryService: LoginHistoryService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('login')
  getLoginHistory(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
  ) {
    return this.loginHistoryService.findAll(page, limit);
  }
}