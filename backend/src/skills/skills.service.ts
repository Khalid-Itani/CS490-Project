import { Injectable } from '@nestjs/common';
import { SkillEntry } from './skills.entity';

@Injectable()
export class SkillsService {
  async getUserSkills(userId: string): Promise<SkillEntry[]> {
    return [
      { skill: 'Java', level: 4 },
      { skill: 'Python', level: 5 },
      { skill: 'React', level: 3 }
    ];
  }
}
