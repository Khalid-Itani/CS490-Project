import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Profile } from './profile.entity';
import { RequestAccountDeletionDto } from './dto/request-account-deletion.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
  private readonly repo: Repository<User>,
  @InjectRepository(Profile)
  private readonly profileRepo: Repository<Profile>,
  ) {}

  // Overloads: support both register(dto) and register(email, password)
  async register(dto: { email: string; password: string }): Promise<{ ok: true; user: any } | { ok: false; message: string }>
  async register(email: string, password: string): Promise<User>
  async register(arg1: any, arg2?: any): Promise<any> {
    let email: string;
    let plainPassword: string;

    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      // called as register(email, password) - return the created user entity
      email = arg1.toLowerCase().trim();
      plainPassword = arg2;
    } else {
      // called as register(dto)
      email = (arg1.email as string).toLowerCase().trim();
      plainPassword = arg1.password as string;
    }

    // basic unique check (DB unique constraint will enforce it later)
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) {
      return { ok: false, message: 'Email already registered' };
    }

    const hash = await bcrypt.hash(plainPassword, 10);
    const user = this.repo.create({ email, password: hash });
    await this.repo.save(user);

    // create an empty profile linked to the user
    const profile = this.profileRepo.create({ displayName: null, user });
    await this.profileRepo.save(profile);

    // attach profile to returned user object
    user.profile = profile;

    // if called as register(email, password) return the user entity directly
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
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) return null;

    const now = new Date();
    const ends = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    user.isPendingDeletion = true;
    user.deletionRequestedAt = now;
    user.deletionGraceUntil = ends;
    user.deletionReason = dto.reason ?? null;
    user.deletionCancelToken = 'TEMP_TOKEN';

    await this.repo.save(user);
    return { message: 'Deletion scheduled', deletionGraceUntil: user.deletionGraceUntil };
  }
}
