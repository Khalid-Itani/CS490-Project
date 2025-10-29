import { Body, Controller, Post, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const firstname = (body as any).firstname ?? (body as any).firstName ?? body.firstname;
    const lastname  = (body as any).lastname  ?? (body as any).lastName  ?? body.lastname;

    if (body.password !== body.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    return this.authService.register(firstname, lastname, body.email, body.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // return 200 instead of 201
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
