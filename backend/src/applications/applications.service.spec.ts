import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      jobApplication: {
        findMany: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all applications', async () => {
    prisma.jobApplication.findMany.mockResolvedValue([]);
    await expect(service.findAll('1')).resolves.toEqual([]);
  });

  it('should create application', async () => {
    prisma.jobApplication.create.mockResolvedValue({ id: 1 });
    await expect(service.create('1', { foo: 'bar' })).resolves.toEqual({ id: 1 });
  });

  it('should update application', async () => {
    prisma.jobApplication.updateMany.mockResolvedValue({ count: 1 });
    await expect(service.update('1', '2', { foo: 'bar' })).resolves.toEqual({ count: 1 });
  });

  it('should remove application', async () => {
    prisma.jobApplication.deleteMany.mockResolvedValue({ count: 1 });
    await expect(service.remove('1', '2')).resolves.toEqual({ count: 1 });
  });
});
