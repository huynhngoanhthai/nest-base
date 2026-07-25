import 'express';
import { Staff } from 'src/modules/staff/entities/staff.entity';

declare global {
  namespace Express {
    interface Request {
      staff?: Staff;
    }
  }
}
