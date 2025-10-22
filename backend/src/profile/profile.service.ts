import { Injectable } from '@nestjs/common';
import { ProfileOverviewDto } from './dto/profile-overview.dto';
import { EmploymentService } from '../employment/employment.service';
import { EducationService } from '../education/education.service';
import { SkillsService } from '../skills/skills.service';
import { ProjectsService } from '../projects/projects.service';
import { ActivityService } from '../activity/activity.services';

@Injectable()
export class ProfileService {
  constructor(
    private employmentService: EmploymentService,
    private educationService: EducationService,
    private skillsService: SkillsService,
    private projectsService: ProjectsService,
    private activityService: ActivityService
  ) {}

  async getProfileOverview(userId: string): Promise<ProfileOverviewDto> {
    const employment = await this.employmentService.getUserEmployment(userId);
    const education = await this.educationService.getUserEducation(userId);
    const skills = await this.skillsService.getUserSkills(userId);
    const projects = await this.projectsService.getUserProjects(userId);
    const recentActivity = await this.activityService.getUserActivity(userId);

    const profileCompletion = this.computeCompletion({ employment, education, skills, projects });

    return {
      employmentSummary: employment,
      educationSummary: education,
      skillsDistribution: skills,
      projectSummary: projects,
      recentActivity,
      profileCompletion,
      profileStrength: this.getStrengthLabel(profileCompletion),
      recommendations: this.generateRecommendations(profileCompletion),
    };
  }

  computeCompletion(data: any): number {
    // TODO: calculate % profile completeness
    return 75; // placeholder
  }

  getStrengthLabel(percent: number): string {
    if (percent > 80) return 'Strong';
    if (percent > 50) return 'Moderate';
    return 'Weak';
  }

  generateRecommendations(percent: number): string[] {
    // TODO: return dynamic recommendations
    return ['Add more skills', 'Complete education entries'];
  }
}
