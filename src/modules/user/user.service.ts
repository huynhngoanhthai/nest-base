import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(user: User) {
    const item = this.userRepository.create(user);
    return this.userRepository.save(item);
  }

  findAll() {
    return this.userRepository.find({ where: { isDeleted: false } });
  }

  findOne(id: number) {
    return this.userRepository.findOne({ where: { id, isDeleted: false } });
  }

  update(id: number, user: User) {
    return this.userRepository.update(id, user);
  }

  remove(id: number) {
    return this.userRepository.update(id, { isDeleted: true });
  }
}
