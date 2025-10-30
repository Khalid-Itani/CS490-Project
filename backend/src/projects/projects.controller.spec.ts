import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: any;

    beforeEach(async () => {
      service = {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        findAllByUser: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        remove: jest.fn().mockResolvedValue({}),
        addMedia: jest.fn().mockResolvedValue({ id: 99 }),
      };
      const module: TestingModule = await Test.createTestingModule({
        controllers: [ProjectsController],
        providers: [
          { provide: ProjectsService, useValue: service },
        ],
      }).compile();
      controller = module.get<ProjectsController>(ProjectsController);
    });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create project', async () => {
    await expect(controller.create({ userId: 1 })).resolves.toEqual({ id: 1 });
  });

  it('should get all projects for user', async () => {
    await expect(controller.findAllByUser('1')).resolves.toEqual([]);
  });

  it('should get one project', async () => {
    await expect(controller.findOne('1')).resolves.toEqual({});
  });

  it('should update project', async () => {
    await expect(controller.update('1', {})).resolves.toEqual({});
  });

  it('should delete project', async () => {
    await expect(controller.remove('1')).resolves.toEqual({});
  });

  it('should add media to project', async () => {
    service.addMedia.mockResolvedValue({ id: 99 });
    await expect(controller.addMedia('1', { url: 'http://img', type: 'IMAGE', caption: 'test' })).resolves.toEqual({ id: 99 });
  });
});
