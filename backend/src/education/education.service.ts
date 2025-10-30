import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';

@Injectable()
export class EducationService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEducationDto) {
    const payload = {
      userId: data.userId,
      degree: data.degree,
      institution: data.institution,
      fieldOfStudy: data.fieldOfStudy,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      ongoing: !!data.ongoing,
      gpa: data.gpa ?? null,
      showGpa: data.showGpa ?? true,
      honors: data.honors ?? [],
      notes: data.notes,
      // educationLevel removed, not in Prisma model
    };
    return (this.prisma as any).education.create({ data: payload });
  }

  async findAllByUser(userId: string) {
    // Return in reverse chronological order by endDate then startDate
    return (this.prisma as any).education.findMany({
      where: { userId: String(userId) },
      orderBy: [
        { endDate: 'desc' },
        { startDate: 'desc' },
      ],
    });
  }

  async findOne(id: number) {
  return (this.prisma as any).education.findUnique({ where: { id } });
  }

  async update(id: number, dto: UpdateEducationDto) {
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    // educationLevel removed, not in Prisma model
    return (this.prisma as any).education.update({ where: { id }, data });
  }

  async remove(id: number) {
  return (this.prisma as any).education.delete({ where: { id } });
  }
}
