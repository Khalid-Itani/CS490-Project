import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContactsService } from './contacts.service';

@Controller('contacts')
@UseGuards(AuthGuard('jwt'))
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async createContact(@Req() req: any, @Body() contactData: any) {
    const userId = req.user.userId;
    return await this.contactsService.createContact(userId, contactData);
  }

  @Get()
  async getContacts(
    @Req() req: any,
    @Query('industry') industry?: string,
    @Query('relationshipType') relationshipType?: string,
    @Query('company') company?: string,
    @Query('search') search?: string,
  ) {
    const userId = req.user.userId;
    const filters = { industry, relationshipType, company, search };
    return await this.contactsService.getContacts(userId, filters);
  }

  @Get('stats')
  async getContactStats(@Req() req: any) {
    const userId = req.user.userId;
    return await this.contactsService.getContactStats(userId);
  }

  @Get('networking-opportunities')
  async getNetworkingOpportunities(@Req() req: any) {
    const userId = req.user.userId;
    return await this.contactsService.getNetworkingOpportunities(userId);
  }

  @Get('reminders')
  async getUpcomingReminders(@Req() req: any) {
    const userId = req.user.userId;
    return await this.contactsService.getUpcomingReminders(userId);
  }

  @Get(':id')
  async getContactById(@Req() req: any, @Param('id') contactId: string) {
    const userId = req.user.userId;
    return await this.contactsService.getContactById(userId, contactId);
  }

  @Put(':id')
  async updateContact(@Req() req: any, @Param('id') contactId: string, @Body() updates: any) {
    const userId = req.user.userId;
    return await this.contactsService.updateContact(userId, contactId, updates);
  }

  @Delete(':id')
  async deleteContact(@Req() req: any, @Param('id') contactId: string) {
    const userId = req.user.userId;
    return await this.contactsService.deleteContact(userId, contactId);
  }

  @Post(':id/interactions')
  async addInteraction(@Req() req: any, @Param('id') contactId: string, @Body() interactionData: any) {
    const userId = req.user.userId;
    return await this.contactsService.addInteraction(userId, contactId, interactionData);
  }

  @Get(':id/interactions')
  async getInteractionHistory(@Req() req: any, @Param('id') contactId: string) {
    const userId = req.user.userId;
    return await this.contactsService.getInteractionHistory(userId, contactId);
  }

  @Post(':id/link-job')
  async linkContactToJob(@Req() req: any, @Param('id') contactId: string, @Body() body: { jobId: string }) {
    const userId = req.user.userId;
    return await this.contactsService.linkContactToJob(userId, contactId, body.jobId);
  }

  @Get('job/:jobId')
  async getContactsByJob(@Req() req: any, @Param('jobId') jobId: string) {
    const userId = req.user.userId;
    return await this.contactsService.getContactsByJob(userId, jobId);
  }

  @Post(':id/reminders')
  async setReminder(@Req() req: any, @Param('id') contactId: string, @Body() reminderData: any) {
    const userId = req.user.userId;
    return await this.contactsService.setReminder(userId, contactId, reminderData);
  }

  @Post('import/google')
  async importFromGoogle(@Req() req: any, @Body() body: { contacts: any[] }) {
    const userId = req.user.userId;
    return await this.contactsService.importFromGoogle(userId, body.contacts);
  }
}
