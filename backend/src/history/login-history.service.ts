import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginHistory } from './entities/login-history.entity';
import { CreateLoginHistoryDto } from './dto/create-login-history.dto';

@Injectable()
export class LoginHistoryService {
  constructor(
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepository: Repository<LoginHistory>,
  ) {}

  async create(createLoginHistoryDto: CreateLoginHistoryDto): Promise<LoginHistory> {
    const newRecord = this.loginHistoryRepository.create(createLoginHistoryDto);
    return this.loginHistoryRepository.save(newRecord);
  }

  async findAll(page: number = 1, limit: number = 15): Promise<{ data: LoginHistory[], total: number, page: number, limit: number }> {
    const [data, total] = await this.loginHistoryRepository.findAndCount({
      relations: ['user'],
      order: {
        loginDate: 'DESC',
      },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total, page, limit };
  }
}