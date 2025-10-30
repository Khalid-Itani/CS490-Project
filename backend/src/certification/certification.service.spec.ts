import { CertificationService } from './certification.service';

describe('CertificationService', () => {
  let service: CertificationService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      certification: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new CertificationService(prisma as any);
  });

  it('should create certification', async () => {
    prisma.certification.create.mockResolvedValue({ id: 1 });
    await expect(service.create({} as any)).resolves.toEqual({ id: 1 });
  });


  it('should find all certifications for user', async () => {
    prisma.certification.findMany.mockResolvedValue([]);
    await expect(service.findAllByUser(1)).resolves.toEqual([]);
  });
  it('should search organizations', async () => {
    prisma.certification.findMany.mockResolvedValue(['Org1', 'Org2']);
    await expect(service.searchOrganizations('Org')).resolves.toEqual(['Org1', 'Org2']);
  });

  it('should find one certification', async () => {
    prisma.certification.findUnique.mockResolvedValue({});
    await expect(service.findOne(1)).resolves.toEqual({});
  });

  it('should update certification', async () => {
    prisma.certification.update.mockResolvedValue({});
    await expect(service.update(1, {})).resolves.toEqual({});
  });

  it('should delete certification', async () => {
    prisma.certification.delete.mockResolvedValue({});
    await expect(service.remove(1)).resolves.toEqual({});
  });
});
