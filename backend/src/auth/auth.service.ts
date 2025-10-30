import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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
    } catch (e) {
      const err = e as Prisma.PrismaClientKnownRequestError;
      if (err.code === 'P2002') throw new ConflictException('Email already registered');
      throw e;
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
}
