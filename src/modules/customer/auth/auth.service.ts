import { Injectable } from '@nestjs/common';
import { FindallDto } from './dto/findall.dto';
import { ResponseAPI } from 'src/common/responses';

@Injectable()
export class AuthService {
  constructor() {}

  async findAll(query: FindallDto) {
    return ResponseAPI.sendOK([]);
  }
}
