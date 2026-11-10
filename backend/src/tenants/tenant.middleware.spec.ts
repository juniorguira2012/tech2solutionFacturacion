import { InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getTenantDataSource, TenantRequest } from './tenant.middleware';

describe('getTenantDataSource', () => {
  it('returns the database resolved for the tenant request', () => {
    const tenantDataSource = {} as DataSource;
    const request = { tenantDataSource } as TenantRequest;

    expect(getTenantDataSource(request)).toBe(tenantDataSource);
  });

  it('does not fall back to the primary database when tenant resolution is missing', () => {
    expect(() => getTenantDataSource({} as TenantRequest)).toThrow(InternalServerErrorException);
  });
});
