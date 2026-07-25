import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const item = this.userRepository.create(createUserDto as any);
    return this.userRepository.save(item);
  }

  findAll() {
    return this.userRepository.find({ where: { isDeleted: false } });
  }

  findOne(id: number) {
    return this.userRepository.findOne({ where: { id, isDeleted: false } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto as any);
  }

  remove(id: number) {
    return this.userRepository.update(id, { isDeleted: true });
  }
}
