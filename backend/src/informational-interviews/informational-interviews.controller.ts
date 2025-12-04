import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InformationalInterviewsService } from './informational-interviews.service';

@Controller('informational-interviews')
@UseGuards(AuthGuard('jwt'))
export class InformationalInterviewsController {
  constructor(private readonly interviewsService: InformationalInterviewsService) {}

  @Post()
  async createInterview(@Request() req, @Body() interviewData: any) {
    return this.interviewsService.createInterview(req.user.userId, interviewData);
  }

  @Get()
  async getInterviews(@Request() req) {
    return this.interviewsService.getInterviews(req.user.userId);
  }

  @Get('stats')
  async getInterviewStats(@Request() req) {
    return this.interviewsService.getInterviewStats(req.user.userId);
  }

  @Get('contacts')
  async getNetworkContacts(@Request() req) {
    return this.interviewsService.getNetworkContacts(req.user.userId);
  }

  @Get('suggested-contacts')
  async getSuggestedContacts(@Request() req) {
    return this.interviewsService.getSuggestedContacts(req.user.userId);
  }

  @Get(':id')
  async getInterviewById(@Request() req, @Param('id') interviewId: string) {
    return this.interviewsService.getInterviewById(req.user.userId, interviewId);
  }

  @Put(':id')
  async updateInterview(@Request() req, @Param('id') interviewId: string, @Body() updates: any) {
    return this.interviewsService.updateInterview(req.user.userId, interviewId, updates);
  }

  @Delete(':id')
  async deleteInterview(@Request() req, @Param('id') interviewId: string) {
    return this.interviewsService.deleteInterview(req.user.userId, interviewId);
  }
}
