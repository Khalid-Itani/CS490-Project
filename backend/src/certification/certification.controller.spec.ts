import { Test, TestingModule } from '@nestjs/testing';
import { CertificationController } from './certification.controller';
import { CertificationService } from './certification.service';

describe('CertificationController', () => {
  let controller: CertificationController;
  let service: any;

    beforeEach(async () => {
      service = {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        findAllByUser: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        remove: jest.fn().mockResolvedValue({}),
        searchOrganizations: jest.fn().mockResolvedValue(['Org1', 'Org2']),
      };
      const module: TestingModule = await Test.createTestingModule({
        controllers: [CertificationController],
        providers: [
          { provide: CertificationService, useValue: service },
        ],
      }).compile();
      controller = module.get<CertificationController>(CertificationController);
    });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create certification', async () => {
    await expect(controller.create({ userId: 1 })).resolves.toEqual({ id: 1 });
  });

  it('should get all certifications for user', async () => {
    await expect(controller.findAllByUser('1')).resolves.toEqual([]);
  });

  it('should get one certification', async () => {
    await expect(controller.findOne('1')).resolves.toEqual({});
  });

  it('should update certification', async () => {
    await expect(controller.update('1', {})).resolves.toEqual({});
  });

  it('should delete certification', async () => {
    await expect(controller.remove('1')).resolves.toEqual({});
  });

  it('should search organizations', async () => {
    await expect(controller.searchOrgs('Org')).resolves.toEqual(['Org1', 'Org2']);
  });
});
