import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CONFIG } from 'src/config/config';
import { JWTAuth, UserAuth } from 'src/common/decorators';
import { FindallDto } from './dto/findall.dto';

@ApiTags('customer - auth')
@Controller(`${CONFIG.API_PREFIX}/customer/auth`)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách auth' })
  findAll(@Query() query: FindallDto) {
    return this.authService.findAll(query);
  }
}
