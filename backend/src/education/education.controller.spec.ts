import { Test, TestingModule } from '@nestjs/testing';
import { EducationController } from './education.controller';
import { EducationService } from './education.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { EducationLevel } from './dto/education-level.enum';

describe('EducationController', () => {
  let controller: EducationController;
  let service: EducationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducationController],
      providers: [
        {
          provide: EducationService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 1 }),
            findAllByUser: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            remove: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();
    controller = module.get<EducationController>(EducationController);
    service = module.get<EducationService>(EducationService);
  });

  it('should create education', async () => {
    const dto: CreateEducationDto = {
      userId: 1,
      degree: 'BSc',
      institution: 'Test University',
      startDate: '2020-01-01',
      educationLevel: EducationLevel.BACHELOR,
    } as any;
    await expect(controller.create(dto)).resolves.toEqual({ id: 1 });
  });

  it('should get all education for user', async () => {
    await expect(controller.findAllByUser('1')).resolves.toEqual([]);
  });

  it('should get one education entry', async () => {
    await expect(controller.findOne('1')).resolves.toEqual({});
  });

  it('should update education', async () => {
    await expect(controller.update('1', {})).resolves.toEqual({});
  });

  it('should delete education', async () => {
    await expect(controller.remove('1')).resolves.toEqual({});
  });
});
