import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NetworkingService } from './networking.service';

@Controller('networking')
@UseGuards(AuthGuard('jwt'))
export class NetworkingController {
  constructor(private readonly networkingService: NetworkingService) {}

  @Post('events')
  async createEvent(@Request() req, @Body() eventData: any) {
    return this.networkingService.createEvent(req.user.userId, eventData);
  }

  @Get('events')
  async getEvents(@Request() req, @Query() filters: any) {
    return this.networkingService.getEvents(req.user.userId, filters);
  }

  @Get('events/upcoming')
  async getUpcomingEvents(@Request() req, @Query('limit') limit?: string) {
    return this.networkingService.getUpcomingEvents(req.user.userId, limit ? parseInt(limit) : 10);
  }

  @Get('events/:id')
  async getEventById(@Request() req, @Param('id') eventId: string) {
    return this.networkingService.getEventById(req.user.userId, eventId);
  }

  @Put('events/:id')
  async updateEvent(@Request() req, @Param('id') eventId: string, @Body() updates: any) {
    return this.networkingService.updateEvent(req.user.userId, eventId, updates);
  }

  @Delete('events/:id')
  async deleteEvent(@Request() req, @Param('id') eventId: string) {
    return this.networkingService.deleteEvent(req.user.userId, eventId);
  }

  @Post('events/:id/connections')
  async addConnectionToEvent(
    @Request() req,
    @Param('id') eventId: string,
    @Body() body: { contactId: string }
  ) {
    return this.networkingService.addConnectionToEvent(req.user.userId, eventId, body.contactId);
  }

  @Get('events/:id/connections')
  async getEventConnections(@Request() req, @Param('id') eventId: string) {
    return this.networkingService.getEventConnections(req.user.userId, eventId);
  }

  @Put('events/:eventId/connections/:contactId/follow-up')
  async markFollowUpComplete(
    @Request() req,
    @Param('eventId') eventId: string,
    @Param('contactId') contactId: string
  ) {
    return this.networkingService.markFollowUpComplete(req.user.userId, eventId, contactId);
  }

  @Get('stats')
  async getNetworkingStats(@Request() req) {
    return this.networkingService.getNetworkingStats(req.user.userId);
  }
}
