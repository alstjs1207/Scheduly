import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { phoneNumber: string; password: string }) {
    const student = await this.authService.validateStudent(
      loginDto.phoneNumber,
      loginDto.password,
    );
    return this.authService.login(student);
  }
} 