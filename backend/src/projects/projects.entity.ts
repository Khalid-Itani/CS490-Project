export class ProjectEntry {
  name: string;
  role: string;
  startDate: string;
  endDate?: string;
  status: 'Completed' | 'Ongoing' | 'Planned';
  technologies?: string[];
  url?: string;
  teamSize?: number;
}
