import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.application.findMany({ where: { userId } });
  }

  create(userId: string, data: any) {
    return this.prisma.application.create({ data: { ...data, userId } });
  }

  update(userId: string, id: string, data: any) {
    return this.prisma.application.updateMany({
      where: { id, userId },
      data,
    });
  }

  remove(userId: string, id: string) {
    return this.prisma.application.deleteMany({ where: { id, userId } });
  }
}
