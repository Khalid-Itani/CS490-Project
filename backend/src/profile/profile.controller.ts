import { Controller, Get, Req } from '@nestjs/common';
//import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
 // constructor(private readonly profileService: ProfileService) {}

  @Get('overview')
  async getProfileOverview(@Req() req) {
    const userId = "mock-user-id";
    //return this.profileService.getProfileOverview(userId);
  }
}
