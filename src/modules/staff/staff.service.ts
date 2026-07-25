import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  create(createStaffDto: CreateStaffDto) {
    const item = this.staffRepository.create(createStaffDto as any);
    return this.staffRepository.save(item);
  }

  findAll() {
    return this.staffRepository.find({ where: { isDeleted: false } });
  }

  findOne(id: number) {
    return this.staffRepository.findOne({ where: { id, isDeleted: false } });
  }

  update(id: number, updateStaffDto: UpdateStaffDto) {
    return this.staffRepository.update(id, updateStaffDto as any);
  }

  remove(id: number) {
    return this.staffRepository.update(id, { isDeleted: true });
  }
}
