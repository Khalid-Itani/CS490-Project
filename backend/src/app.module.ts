import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ApplicationsModule } from './applications/applications.module';
import { PrismaService } from './prisma/prisma.service';  

@Module({
  imports: [AuthModule, ApplicationsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [AppService, PrismaService],
})
export class AppModule {}
