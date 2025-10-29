import { Controller, Get, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('profile')
export class ProfileController {
  constructor(private prisma: PrismaService) {}

  @Get('overview')
  async getProfileOverview(@Req() req) {
    // NOTE: replace this with real auth in future; for now expect userId query or mock
    const userId = Number(req.query.userId) || null;
    if (!userId) {
      return { message: 'provide userId as query param for overview' };
    }

    const [education, certifications, projects] = await Promise.all([
      (this.prisma as any).education.findMany({ where: { userId }, orderBy: { startDate: 'desc' }, take: 5 }),
      (this.prisma as any).certification.findMany({ where: { userId }, orderBy: { dateEarned: 'desc' }, take: 5 }),
      (this.prisma as any).project.findMany({ where: { userId }, orderBy: { startDate: 'desc' }, take: 6 }),
    ]);

    const completion = this.calculateProfileCompletion(userId);

    return {
      summary: {
        educationCount: await (this.prisma as any).education.count({ where: { userId } }),
        certificationCount: await (this.prisma as any).certification.count({ where: { userId } }),
        projectCount: await (this.prisma as any).project.count({ where: { userId } }),
      },
      recent: { education, certifications, projects },
      completion,
    };
  }

  // very small heuristic for profile completion
  private async calculateProfileCompletion(userId: number) {
    const totalSections = 4; // employment, skills, education, projects (approx)
    const checks = [] as number[];
  const educCount = await (this.prisma as any).education.count({ where: { userId } });
    checks.push(educCount > 0 ? 1 : 0);
  const certCount = await (this.prisma as any).certification.count({ where: { userId } });
    checks.push(certCount > 0 ? 1 : 0);
  const projectCount = await (this.prisma as any).project.count({ where: { userId } });
    checks.push(projectCount > 0 ? 1 : 0);
    // rudimentary skill/employment detection: look for job applications as proxy
  const apps = await (this.prisma as any).jobApplication.count({ where: { userId } });
    checks.push(apps > 0 ? 1 : 0);

    const score = Math.round((checks.reduce((a, b) => a + b, 0) / totalSections) * 100);
    return { score, sections: { education: educCount, certifications: certCount, projects: projectCount, applications: apps } };
  }
}
