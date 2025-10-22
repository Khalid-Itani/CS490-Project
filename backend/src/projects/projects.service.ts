import { Injectable } from '@nestjs/common';
import { ProjectEntry } from './projects.entity';

@Injectable()
export class ProjectsService {
  async getUserProjects(userId: string): Promise<ProjectEntry[]> {
    return [
      { name: 'Dev Dashboard', role: 'Full Stack Developer', startDate: '2025-06', endDate: '2025-08', status: 'Ongoing', technologies: ['Java', 'React'], teamSize: 3 }
    ];
  }
}
