import { Body, Controller, Post, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { RequestAccountDeletionDto } from './dto/request-account-deletion.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    const user = await this.usersService.register(body.email, body.password);
    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }

  @Post(':id/delete')
  async requestDeletion(
    @Param('id') id: string,
    @Body() dto: RequestAccountDeletionDto,
  ) {
    const result = await this.usersService.requestAccountDeletion(id, dto);
    if (!result) {
      return { message: 'User not found' };
    }
    return { message: 'Deletion scheduled', graceEndsAt: result.deletionGraceUntil };
  }
}
