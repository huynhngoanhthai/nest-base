import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CONFIG } from 'src/config/config';
import { InitDto } from './dto/init.dto';

@ApiTags('auth')
@Controller(`${CONFIG.API_PREFIX}/auth`)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('init-admin')
  initAdmin(@Body() initDto: InitDto) {
    return this.authService.initAdmin(initDto);
  }

  @Get('profile')
  getProfile() {
    return this.authService.getProfile(1);
  }
}
