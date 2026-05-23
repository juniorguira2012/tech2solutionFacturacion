import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users from service', async () => {
      const result = [{ id: 1, nombre: 'Admin' }];
      mockUsersService.findAll.mockResolvedValue(result);
      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a user via service', async () => {
      const dto = { nombre: 'John Doe', email: 'john@example.com' };
      mockUsersService.create.mockResolvedValue({ id: 1, ...dto });
      expect(await controller.create(dto)).toEqual({ id: 1, ...dto });
    });
  });
});