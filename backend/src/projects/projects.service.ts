import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const payload: any = {
      user: { connect: { id: data.userId } },
      name: data.name,
      description: data.description,
      role: data.role,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      technologies: data.technologies ?? [],
      url: data.url,
      teamSize: data.teamSize,
      outcomes: data.outcomes,
      industry: data.industry,
      status: data.status,
    };
  return (this.prisma as any).project.create({ data: payload });
  }

  async findAllByUser(userId: number) {
  return (this.prisma as any).project.findMany({ where: { userId }, orderBy: { startDate: 'desc' } });
  }

  async findOne(id: number) {
  return (this.prisma as any).project.findUnique({ where: { id }, include: { media: true } });
  }

  async update(id: number, data: any) {
    const payload: any = { ...data };
    if (data.startDate) payload.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) payload.endDate = data.endDate ? new Date(data.endDate) : null;
  return (this.prisma as any).project.update({ where: { id }, data: payload });
  }

  async remove(id: number) {
  return (this.prisma as any).project.delete({ where: { id } });
  }

  async addMedia(projectId: number, url: string, type = 'IMAGE', caption?: string) {
  return (this.prisma as any).projectMedia.create({ data: { project: { connect: { id: projectId } }, url, type, caption } });
  }
}
