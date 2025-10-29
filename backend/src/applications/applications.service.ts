import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Fetch all job applications for a user
  findAll(userId: string) {
    return this.prisma.jobApplication.findMany({
      where: { userId }, // no Number()
    });
  }

  // ✅ Create a new application for a user
  async create(userId: string, data: any) {
    return this.prisma.jobApplication.create({
      data: {
        ...data,
        userId, // no Number()
      },
    });
  }

  // ✅ Update a specific job application for a user
  async update(userId: string, id: string, data: any) {
    return this.prisma.jobApplication.updateMany({
      where: { id, userId }, // both strings
      data,
    });
  }

  // ✅ Delete a job application for a user
  async remove(userId: string, id: string) {
    return this.prisma.jobApplication.deleteMany({
      where: { id, userId }, // both strings
    });
  }
}
