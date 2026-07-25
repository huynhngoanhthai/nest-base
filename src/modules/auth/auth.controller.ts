import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CONFIG } from 'src/config/config';
import { LoginDto } from './dto/login.dto';
import { ResponseAPI } from 'src/common/responses';
import { Staff } from '../staff/entities/staff.entity';
import { JWT, Password } from 'src/common/utils';
import { BadRequest } from 'src/common/exceptions';
import { InitDto } from './dto/init.dto';
import { JWTAuth, UserAuth } from 'src/common/decorators';
import { Request } from 'express';

@ApiTags('auth')
@Controller(`${CONFIG.API_PREFIX}/auth`)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDTO: LoginDto) {
    const staff = await Staff.findOneOrThrowOption({
      where: {
        username: loginDTO.username,
        isDeleted: false,
      },
      select: {
        id: true,
        password: true,
        username: true,
      },
    });

    const isMatch = await Password.validate(loginDTO.password, staff.password);
    if (!isMatch) {
      throw new BadRequest('Sai mật khẩu');
    }

    const token = JWT.sign({ id: staff.id, username: staff.username });

    return ResponseAPI.sendOK(token);
  }

  @Post('init')
  async init(@Body() initDto: InitDto) {
    if (initDto.password != 'init_amdin') {
      throw new BadRequest('Sai pass');
    }

    const exist = await Staff.findOne({
      where: {
        username: 'admin',
      },
    });

    if (exist) {
      throw new BadRequest('Đã tồn tại admin');
    }
    const staff = new Staff();
    staff.username = 'admin';
    staff.name = 'admin';
    staff.password = await Password.hash('123456');
    await staff.save();

    return ResponseAPI.sendOK(staff);
  }

  @Get('profile')
  @UserAuth(JWTAuth)
  getProfile(@Req() req: Request) {
    return ResponseAPI.sendOK(req.staff);
  }
}
