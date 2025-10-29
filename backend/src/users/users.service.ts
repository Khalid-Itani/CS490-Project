import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RequestAccountDeletionDto } from './dto/request-account-deletion.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: { email: string; password: string }): Promise<{ ok: true; user: any } | { ok: false; message: string }>;
  async register(email: string, password: string): Promise<any>;
  async register(arg1: any, arg2?: any): Promise<any> {
    let email: string;
    let plainPassword: string;

    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      email = arg1.toLowerCase().trim();
      plainPassword = arg2;
    } else {
      email = (arg1.email as string).toLowerCase().trim();
      plainPassword = arg1.password as string;
    }

    // ✅ Check if user already exists
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return { ok: false, message: 'Email already registered' };

    const hash = await bcrypt.hash(plainPassword, 10);

    // ✅ Create user and empty profile
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hash,
        profile: { create: {} },
      },
      include: { profile: true },
    });

    // ✅ Return depending on overload usage
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      return user;
    }

    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async requestAccountDeletion(userId: string, dto: RequestAccountDeletionDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const now = new Date();
    const ends = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isPendingDeletion: true,
        deletionRequestedAt: now,
        deletionGraceUntil: ends,
        deletionReason: dto.reason ?? null,
        deletionCancelToken: 'TEMP_TOKEN',
      },
    });

    return {
      message: 'Deletion scheduled',
      deletionGraceUntil: updated.deletionGraceUntil,
    };
  }
}
