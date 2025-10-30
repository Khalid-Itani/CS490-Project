import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.jobApplication.findMany({ where: { userId } });
  }

  create(userId: string, data: any) {
    return this.prisma.jobApplication.create({ data: { ...data, userId } });
  }

  update(userId: string, id: string, data: any) {
    return this.prisma.jobApplication.updateMany({
      where: { id: Number(id), userId },
      data,
    });
  }

  remove(userId: string, id: string) {
    return this.prisma.jobApplication.deleteMany({ where: { id: Number(id), userId } });
  }
}
