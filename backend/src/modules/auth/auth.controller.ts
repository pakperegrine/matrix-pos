import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private svc: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.svc.login(body.email, body.password);
  }

  @Post('signup')
  async signup(@Body() body: { name: string; email: string; password: string; businessId?: string }) {
    return this.svc.signup(body.name, body.email, body.password, body.businessId);
  }
}
