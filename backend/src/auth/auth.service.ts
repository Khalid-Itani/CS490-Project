import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async register(firstname: string, lastname: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: { firstname, lastname, email: normalizedEmail, password: hash },
      });
      return {
        token: this.jwtService.sign({ sub: user.id.toString(), email: user.email }),
        user: { id: user.id, firstname: user.firstname, lastname: user.lastname, email: user.email },
        message: 'Registration successful',
      };
    } catch (e: any) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') throw new ConflictException('Email already registered');
        if (e.code === 'P2003') throw new ConflictException('Foreign key constraint failed');
        // Add more Prisma error codes as needed
        throw new ConflictException(`Prisma error: ${e.message}`);
      }
      throw new ConflictException(e?.message || 'Unknown error during registration');
    }
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return {
      token: this.jwtService.sign({ sub: user.id.toString(), email: user.email }),
      user: { id: user.id, firstname: user.firstname, lastname: user.lastname, email: user.email },
      message: 'Login successful',
    };
  }

  async loginOrCreateOAuthUser(provider: string, profile: { email?: string; firstname?: string; lastname?: string }) {
    const email = (profile.email || '').trim().toLowerCase();
    if (!email) throw new UnauthorizedException(`${provider} account does not provide an email`);

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Create a password placeholder for OAuth users
      const hash = await bcrypt.hash(`oauth:${provider}:${email}:${Date.now()}`, 10);
      const firstname = profile.firstname || 'User';
      const lastname = profile.lastname || provider;
      user = await this.prisma.user.create({ data: { email, password: hash, firstname, lastname } });
    }

    return {
      token: this.jwtService.sign({ sub: user.id.toString(), email: user.email }),
      user: { id: user.id, firstname: user.firstname, lastname: user.lastname, email: user.email },
      message: `${provider} login successful`,
    };
  }
  async getUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async updateUserProfile(userId: string, data: any) {
    // Only allow updating certain fields
    const allowed = ['firstname', 'lastname', 'email'];
    const update: any = {};
    for (const key of allowed) {
      if (data[key] !== undefined) update[key] = data[key];
    }
    if (update.email) update.email = update.email.trim().toLowerCase();
    return this.prisma.user.update({ where: { id: userId }, data: update });
  }
}
