import { Injectable } from '@nestjs/common';
import { EducationEntry } from './education.entity';

@Injectable()
export class EducationService {
  async getUserEducation(userId: string): Promise<EducationEntry[]> {
    return [
      { degree: 'B.S. Computer Science', institution: 'NJIT', fieldOfStudy: 'Computer Science', startDate: '2022-08', endDate: '2026-05', ongoing: true, gpa: 3.44, honors: ['Dean’s List'] }
    ];
  }
}
