import { EducationLevel } from './education-level.enum';

export class CreateEducationDto {
  userId: number;
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  startDate: string; // ISO date
  endDate?: string;
  ongoing?: boolean;
  gpa?: number;
  showGpa?: boolean;
  honors?: string[];
  notes?: string;
  educationLevel: EducationLevel;
}
