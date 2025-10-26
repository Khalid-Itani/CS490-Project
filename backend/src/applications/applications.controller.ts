import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private appService: ApplicationsService) {}

  @Get()
  getAll(@Req() req) {
    return this.appService.findAll(req.user.userId);
  }

  @Post()
  create(@Req() req, @Body() data: any) {
    return this.appService.create(req.user.userId, data);
  }

  @Put(':id')
  update(@Req() req, @Param('id') id: string, @Body() data: any) {
    return this.appService.update(req.user.userId, id, data);
  }

  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.appService.remove(req.user.userId, id);
  }
}
