import { EducationService } from './education.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { EducationLevel } from './dto/education-level.enum';

describe('EducationService', () => {
  let service: EducationService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      education: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new EducationService(prisma as any);
  });

  it('should create education', async () => {
    prisma.education.create.mockResolvedValue({ id: 1 });
    const dto: CreateEducationDto = {
      userId: 1,
      degree: 'BSc',
      institution: 'Test University',
      startDate: '2020-01-01',
      educationLevel: EducationLevel.BACHELOR,
    } as any;
    await expect(service.create(dto)).resolves.toEqual({ id: 1 });
  });

  it('should find all by user', async () => {
    prisma.education.findMany.mockResolvedValue([]);
    await expect(service.findAllByUser(1)).resolves.toEqual([]);
  });

  it('should find one', async () => {
    prisma.education.findUnique.mockResolvedValue({});
    await expect(service.findOne(1)).resolves.toEqual({});
  });

  it('should update', async () => {
    prisma.education.update.mockResolvedValue({});
    await expect(service.update(1, {})).resolves.toEqual({});
  });

  it('should delete', async () => {
    prisma.education.delete.mockResolvedValue({});
    await expect(service.remove(1)).resolves.toEqual({});
  });
});
