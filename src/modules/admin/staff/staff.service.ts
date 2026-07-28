import { Injectable } from '@nestjs/common';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { FindallDto } from './dto/findall.dto';

@Injectable()
export class StaffService {
  constructor() {}

  create(createStaffDto: CreateStaffDto) {
    const item = createStaffDto.staff;
    return Staff.create(item);
  }

  async findAll(query: FindallDto) {
    const { search, page, limit } = query;
    let where = `staff.isDeleted = false`;
    if (search) {
      where += ` AND CONCAT(staff.name) LIKE :search`;
    }
    const [staffs, total] = await Staff.createQueryBuilder('staff')
      .where(where, {
        search: `%${search}%`,
      })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('staff.id', 'DESC')
      .getManyAndCount();

    return { staffs, total };
  }

  findOne(id: number) {
    return Staff.findOne({ where: { id, isDeleted: false } });
  }

  update(id: number, updateStaffDto: UpdateStaffDto) {
    const item = updateStaffDto.staff;
    item.id = +id;
    return Staff.save(item);
  }

  remove(id: number) {
    const item = new Staff();
    item.id = +id;
    item.isDeleted = true;
    return Staff.save(item);
  }
}
