export interface ProfileOverviewDto {
  employmentSummary: any[]; // replace "any" with your EmploymentEntry type
  educationSummary: any[];  // replace "any" with your EducationEntry type
  skillsDistribution: { skill: string; level: number }[];
  projectSummary: any[];    
  recentActivity: any[];    
  profileCompletion: number;
  profileStrength: string;
  recommendations: string[];
}
