import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { EmploymentService } from '../employment/employment.service';
import { EducationService } from '../education/education.service';
import { SkillsService } from '../skills/skills.service';
import { ProjectsService } from '../projects/projects.service';
import { ActivityService } from '../activity/activity.services';
@Module({
  controllers: [ProfileController],
  providers: [
    ProfileService,
    EmploymentService,
    EducationService,
    SkillsService,
    ProjectsService,
    ActivityService
  ],
})
export class ProfileModule {}
