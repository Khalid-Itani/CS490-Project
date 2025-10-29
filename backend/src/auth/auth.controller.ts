import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    // Accept either `firstname`/`lastname` or `firstName`/`lastName` from clients
    const firstname = body.firstname ?? body.firstName;
    const lastname = body.lastname ?? body.lastName;
    return this.authService.register(firstname, lastname, body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
