import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private svc: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      return await this.svc.login(body.email, body.password);
    } catch (error) {
      throw new HttpException(error.message || 'Login failed', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('signup')
  async signup(@Body() body: { name: string; email: string; password: string; businessId?: string }) {
    try {
      return await this.svc.signup(body.name, body.email, body.password, body.businessId);
    } catch (error) {
      throw new HttpException(error.message || 'Signup failed', HttpStatus.BAD_REQUEST);
    }
  }
}
