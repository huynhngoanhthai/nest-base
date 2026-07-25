import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JWT } from 'src/common/utils';
import { Unauthorized } from 'src/common/exceptions';
// import { User } from 'src/modules/user/entities/user.entity';
import { Request } from 'express';

export interface Payload {
  id: number;
  type: 'STAFF' | 'CUSTOMER';
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Unauthorized('Vui lòng đăng nhập (Thiếu Access Token)');
    }

    const token = authHeader.split(' ')[1];
    const payload = JWT.verify<Payload>(token);

    // const user = await User.findOne({
    //   where: {
    //     id: payload.id,
    //     isDeleted: false,
    //   },
    // });

    // if (!user) {
    //   throw new Unauthorized('Không tìm thấy người dùng');
    // }

    // request.user = user;

    return true;
  }
}
