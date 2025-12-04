import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContactDiscoveryService } from './contact-discovery.service';

@Controller('contact-discovery')
@UseGuards(AuthGuard('jwt'))
export class ContactDiscoveryController {
  constructor(private readonly contactDiscovery: ContactDiscoveryService) {}

  /**
   * Search for professionals using SERP API
   * GET /contact-discovery/search?role=CTO&industry=Tech&location=SF&limit=10
   */
  @Get('search')
  async searchProfessionals(
    @Query('role') role: string,
    @Query('industry') industry?: string,
    @Query('location') location?: string,
    @Query('limit') limit?: string,
  ) {
    if (!role) {
      throw new HttpException(
        'Role parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const contacts = await this.contactDiscovery.searchProfessionals(
        role,
        industry,
        location,
        limit ? parseInt(limit) : 10,
      );
      return { success: true, data: contacts };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to search professionals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get suggested search queries
   * GET /contact-discovery/suggestions
   */
  @Get('suggestions')
  getSuggestions() {
    const suggestions = this.contactDiscovery.getSuggestedSearches();
    return { success: true, data: suggestions };
  }

  /**
   * Get saved discovered contacts
   * GET /contact-discovery/saved
   */
  @Get('saved')
  async getSavedContacts(@Request() req) {
    try {
      const contacts = await this.contactDiscovery.getSavedContacts(
        req.user.sub,
      );
      return { success: true, data: contacts };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch saved contacts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Save a discovered contact
   * POST /contact-discovery/save
   */
  @Post('save')
  async saveContact(
    @Request() req,
    @Body()
    body: {
      name: string;
      title: string;
      company: string;
      linkedin_url: string;
      snippet?: string;
      search_query?: string;
    },
  ) {
    try {
      const contact = await this.contactDiscovery.saveDiscoveredContact(
        req.user.sub,
        body,
      );
      return { success: true, data: contact };
    } catch (error) {
      throw new HttpException(
        'Failed to save contact',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Add discovered contact to network
   * POST /contact-discovery/:id/add-to-network
   */
  @Post(':id/add-to-network')
  async addToNetwork(@Request() req, @Param('id') id: string) {
    try {
      const networkContact = await this.contactDiscovery.addToNetwork(
        req.user.sub,
        id,
      );
      return { success: true, data: networkContact };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to add contact to network',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Delete a discovered contact
   * DELETE /contact-discovery/:id
   */
  @Delete(':id')
  async deleteContact(@Request() req, @Param('id') id: string) {
    try {
      await this.contactDiscovery.deleteDiscoveredContact(req.user.sub, id);
      return { success: true, message: 'Contact deleted successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to delete contact',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
