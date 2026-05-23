import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUserRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [{ id: 1, nombre: 'Test User', email: 'test@test.com' }];
      mockUserRepository.find.mockResolvedValue(result);

      expect(await service.findAll()).toEqual(result);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should successfully insert a user', async () => {
      const userData = { nombre: 'New User', email: 'new@test.com' };
      mockUserRepository.create.mockReturnValue(userData);
      mockUserRepository.save.mockResolvedValue({ id: 1, ...userData });

      expect(await service.create(userData)).toEqual({ id: 1, ...userData });
    });
  });
});