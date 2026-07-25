import jwt, { Secret } from 'jsonwebtoken';
import { CONFIG } from 'src/config/config';
import { Unauthorized } from 'src/common/exceptions';

export class JWT {
  /**
   * Tạo JWT Token cực kỳ đơn giản
   * @example const token = JWT.sign({ id: user.id, email: user.email });
   */
  static sign(
    payload: object,
    expiresIn: string = CONFIG.JWT_REFRESH_EXPIRES_IN || '7d',
  ): string {
    const secret: Secret = CONFIG.JWT_ACCESS_SECRET || 'access_secret_key';
    return jwt.sign(payload, secret, {
      expiresIn: expiresIn as unknown as number,
    });
  }

  /**
   * Giải mã / Kiểm tra JWT Token
   * @example const payload = JWT.verify(token);
   */
  static verify<T = Record<string, unknown>>(token: string): T {
    try {
      const secret: Secret = CONFIG.JWT_ACCESS_SECRET || 'access_secret_key';
      return jwt.verify(token, secret) as T;
    } catch {
      throw new Unauthorized('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
