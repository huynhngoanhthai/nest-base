import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/base/BaseEntity';
import { Entity } from 'typeorm';
import { Column } from 'typeorm/browser';

@Entity('users')
export class User extends BaseEntity {
  @Column({ default: '' })
  @ApiProperty()
  name: string;
}
