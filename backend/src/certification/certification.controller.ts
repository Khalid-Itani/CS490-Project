import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CertificationService } from './certification.service';

@Controller('certifications')
export class CertificationController {
  constructor(private readonly certService: CertificationService) {}

  @Post()
  create(@Body() body: any) {
    return this.certService.create(body);
  }

  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string) {
    return this.certService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.certService.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.certService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.certService.remove(Number(id));
  }

  @Get('search/organizations')
  searchOrgs(@Query('q') q: string) {
    return this.certService.searchOrganizations(q || '');
  }
}
