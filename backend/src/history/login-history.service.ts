import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource, Repository } from 'typeorm';
import { LoginHistory } from './entities/login-history.entity';
import { CreateLoginHistoryDto } from './dto/create-login-history.dto';
import { getTenantDataSource } from '../tenants/tenant.middleware';

@Injectable({ scope: Scope.REQUEST })
export class LoginHistoryService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSource: DataSource,
  ) {}

  private get loginHistoryRepository(): Repository<LoginHistory> {
    return getTenantDataSource(this.request).getRepository(LoginHistory);
  }

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