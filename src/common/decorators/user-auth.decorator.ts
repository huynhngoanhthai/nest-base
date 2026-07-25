import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

export const JWTAuth = 'JWTAuth';

/**
 * Decorator xác thực người dùng trên Route / Controller
 *
 * @example
 * @Get('profile')
 * @UserAuth(JWTAuth)
 * getProfile(@Req() req: RequestWithUser) {
 *   return req.user;
 * }
 */
export function UserAuth(_type: string = JWTAuth) {
  return applyDecorators(UseGuards(JwtAuthGuard), ApiBearerAuth('JWT-auth'));
}
