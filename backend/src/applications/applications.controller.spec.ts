import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let service: any;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ count: 1 }),
      remove: jest.fn().mockResolvedValue({ count: 1 }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        { provide: ApplicationsService, useValue: service },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all applications', async () => {
    const req = { user: { userId: '1' } };
    await expect(controller.getAll(req)).resolves.toEqual([]);
  });

  it('should create application', async () => {
    const req = { user: { userId: '1' } };
    await expect(controller.create(req, { foo: 'bar' })).resolves.toEqual({ id: 1 });
  });

  it('should update application', async () => {
    const req = { user: { userId: '1' } };
    await expect(controller.update(req, '2', { foo: 'bar' })).resolves.toEqual({ count: 1 });
  });

  it('should delete application', async () => {
    const req = { user: { userId: '1' } };
    await expect(controller.delete(req, '2')).resolves.toEqual({ count: 1 });
  });
});
