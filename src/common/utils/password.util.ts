import bcrypt from 'bcrypt';
import { CONFIG } from 'src/config/config';

export class Password {
  static async hash(password: string): Promise<string> {
    const hashed = (await bcrypt.hash(
      password,
      CONFIG.BCRYPT_SALT_ROUNDS,
    )) as string;
    return hashed;
  }

  static async validate(password: string, hash: string): Promise<boolean> {
    const isMatch = (await bcrypt.compare(password, hash)) as boolean;
    return isMatch;
  }
}
