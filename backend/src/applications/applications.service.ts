import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.jobApplication.findMany({ where: { userId: Number(userId) } });
  }

  create(userId: string, data: any) {
    return this.prisma.jobApplication.create({ data: { ...data, userId: Number(userId) } });
  }

  update(userId: string, id: string, data: any) {
    return this.prisma.jobApplication.updateMany({
      where: { id: Number(id), userId: Number(userId)  },
      data,
    });
  }

  remove(userId: string, id: string) {
    return this.prisma.jobApplication.deleteMany({ where: { id: Number(id), userId: Number(userId) } });
  }
}
