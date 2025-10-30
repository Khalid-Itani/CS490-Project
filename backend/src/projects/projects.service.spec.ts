import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      project: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new ProjectsService(prisma as any);
  });

  it('should create project', async () => {
    prisma.project.create.mockResolvedValue({ id: 1 });
    await expect(service.create({} as any)).resolves.toEqual({ id: 1 });
  });


  it('should find all projects for user', async () => {
    prisma.project.findMany.mockResolvedValue([]);
    await expect(service.findAllByUser(1)).resolves.toEqual([]);
  });
  it('should add media to project', async () => {
    prisma.projectMedia = { create: jest.fn().mockResolvedValue({ id: 99 }) };
    await expect(service.addMedia(1, 'http://img', 'IMAGE', 'test')).resolves.toEqual({ id: 99 });
  });

  it('should find one project', async () => {
    prisma.project.findUnique.mockResolvedValue({});
    await expect(service.findOne(1)).resolves.toEqual({});
  });

  it('should update project', async () => {
    prisma.project.update.mockResolvedValue({});
    await expect(service.update(1, {})).resolves.toEqual({});
  });

  it('should delete project', async () => {
    prisma.project.delete.mockResolvedValue({});
    await expect(service.remove(1)).resolves.toEqual({});
  });
});
