import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CertificationService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const payload: any = {
      user: { connect: { id: data.userId } },
      name: data.name,
      issuingOrganization: data.issuingOrganization,
      dateEarned: new Date(data.dateEarned),
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
      doesNotExpire: !!data.doesNotExpire,
      certificationNumber: data.certificationNumber,
      documentUrl: data.documentUrl,
      category: data.category,
      renewalReminderDays: data.renewalReminderDays,
    };
  return (this.prisma as any).certification.create({ data: payload });
  }

  async findAllByUser(userId: number) {
  return (this.prisma as any).certification.findMany({ where: { userId }, orderBy: { dateEarned: 'desc' } });
  }

  async findOne(id: number) {
  return (this.prisma as any).certification.findUnique({ where: { id } });
  }

  async update(id: number, data: any) {
    const payload: any = { ...data };
    if (data.dateEarned) payload.dateEarned = new Date(data.dateEarned);
    if (data.expirationDate !== undefined) payload.expirationDate = data.expirationDate ? new Date(data.expirationDate) : null;
  return (this.prisma as any).certification.update({ where: { id }, data: payload });
  }

  async remove(id: number) {
  return (this.prisma as any).certification.delete({ where: { id } });
  }

  async searchOrganizations(q: string) {
    return (this.prisma as any).certification.findMany({
      where: { issuingOrganization: { contains: q, mode: 'insensitive' } },
      take: 10,
      distinct: ['issuingOrganization'],
    });
  }
}
