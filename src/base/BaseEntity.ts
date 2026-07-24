import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';
import dayjs from 'dayjs';

export class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: 0, type: 'bigint' })
  createdAt: number;

  @Column({ default: 0, type: 'bigint' })
  updatedAt: number;

  @BeforeInsert()
  setCreatedAt() {
    const now = dayjs().unix();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = dayjs().unix();
  }
}
