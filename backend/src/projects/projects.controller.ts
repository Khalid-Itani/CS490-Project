import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() body: any) {
    return this.projectsService.create(body);
  }

  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string) {
    return this.projectsService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(Number(id));
  }

  @Post(':id/media')
  addMedia(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.addMedia(Number(id), body.url, body.type, body.caption);
  }
}
