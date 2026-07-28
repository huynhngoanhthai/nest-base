import { PartialType } from '@nestjs/swagger';
import { CreateStaffDto } from './create-staff.dto';
import { Staff } from '../entities/staff.entity';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
  staff: Staff;
}
