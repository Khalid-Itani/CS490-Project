import { Injectable } from '@nestjs/common';
import { EmploymentEntry } from './employment.entity';

@Injectable()
export class EmploymentService {
  async getUserEmployment(userId: string): Promise<EmploymentEntry[]> {
    // Mock data
    return [
      { role: 'Software Engineer Intern', company: 'Wells Fargo', startDate: '2025-06', endDate: '2025-08', ongoing: false },
      { role: 'Kitchen Manager', company: 'Chipotle', startDate: '2023-05', endDate: '2025-05', ongoing: false },
    ];
  }
}
