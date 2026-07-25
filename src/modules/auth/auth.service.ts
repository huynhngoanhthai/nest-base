import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InitDto } from './dto/init.dto';
import { BadRequest } from 'src/common/exceptions';
import { SuccessResponse } from 'src/common/responses';
import { User } from '../user/entities/user.entity';
import { Password } from 'src/common/utils';

@Injectable()
export class AuthService {
  async initAdmin(initDto: InitDto) {
    if (initDto.password !== 'init_admin') {
      throw new BadRequest('Invalid password');
    }

    const exist = await User.findOne({ where: { name: 'admin' } });
    if (exist) {
      throw new BadRequest('Admin already exists');
    }
    const user = new User();
    user.name = 'admin';
    user.email = 'admin';
    user.password = await Password.hash('123456');
    await user.save();

    return SuccessResponse.ok(null, 'Init admin successfully');
  }

  async login(loginDto: LoginDto) {
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequest('Email and password are required');
    }
    const user = await User.findOne({
      where: {
        email: loginDto.email,
        isDeleted: false,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new BadRequest('User not found');
    }

    console.log(user);

    const isPasswordValid = await Password.validate(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequest('Invalid password');
    }

    return SuccessResponse.ok({}, 'Login successfully');
  }

  register(registerDto: RegisterDto) {
    return SuccessResponse.created(
      {
        name: registerDto.name,
        email: registerDto.email,
      },
      'Register successfully',
    );
  }

  getProfile(userId: number) {
    return SuccessResponse.ok(
      {
        id: userId,
        name: 'Sample User',
        email: 'user@example.com',
      },
      'Get profile successfully',
    );
  }
}
