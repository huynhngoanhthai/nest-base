import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JWT } from 'src/common/utils';
import { Unauthorized } from 'src/common/exceptions';
import { Staff } from 'src/modules/admin/staff/entities/staff.entity';
import { CONFIG } from 'src/config/config';

export enum ModuleType {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}

export interface Payload {
  id: number;
  moduleType: ModuleType;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    const payload = JWT.verify<Payload>(token);

    const path = request.baseUrl;

    // Xử lý xác thực cho module ADMIN
    if (
      this.isModulePath(path, ModuleType.ADMIN) &&
      payload.moduleType === ModuleType.ADMIN
    ) {
      await this.validateAdmin(request, payload.id);
      return true;
    }

    // Xử lý xác thực cho module CUSTOMER
    if (
      this.isModulePath(path, ModuleType.CUSTOMER) &&
      payload.moduleType === ModuleType.CUSTOMER
    ) {
      await this.validateCustomer(request, payload.id);
      return true;
    }

    throw new Unauthorized('Quyền truy cập không hợp lệ');
  }

  /**
   * Tách Token từ Header Authorization
   */
  private extractTokenFromHeader(request: Request): string {
    const authHeader = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Unauthorized('Vui lòng đăng nhập (Thiếu Access Token)');
    }

    return authHeader.split(' ')[1];
  }

  /**
   * Kiểm tra path hiện tại có thuộc ModuleType tương ứng không
   */
  private isModulePath(path: string, moduleType: ModuleType): boolean {
    const targetPrefix = `${CONFIG.API_PREFIX}/${moduleType.toLowerCase()}`;
    return path.includes(targetPrefix);
  }

  /**
   * Xác thực tài khoản Admin (Staff)
   */
  private async validateAdmin(request: Request, id: number): Promise<void> {
    const staff = await Staff.findOne({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!staff) {
      throw new Unauthorized('Không tìm thấy người dùng');
    }

    request.staff = staff;
  }

  /**
   * Xác thực tài khoản Customer
   */
  private async validateCustomer(
    _request: Request,
    _id: number,
  ): Promise<void> {
    // TODO: Xử lý tìm Customer entity khi phát triển module Customer
  }
}
