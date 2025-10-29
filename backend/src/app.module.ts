// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { ApplicationsModule } from './applications/applications.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    // Load .env and expose ConfigService app-wide
    ConfigModule.forRoot({ isGlobal: true }),

    // Feature modules
    AuthModule,
    ApplicationsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [AppService, PrismaService],
})
export class AppModule {}
