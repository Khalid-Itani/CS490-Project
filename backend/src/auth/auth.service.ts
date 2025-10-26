import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async register(name: string, email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({ data: { name, email, password: hash } });
    return this.generateToken(user.id.toString(), user.email);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');
    return this.generateToken(user.id.toString(), user.email);
  }

  generateToken(userId: string, email: string) {
    return this.jwtService.sign({ sub: userId, email });
  }
}
