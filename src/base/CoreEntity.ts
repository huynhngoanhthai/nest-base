import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ObjectType,
  FindOneOptions,
} from 'typeorm';
import dayjs from 'dayjs';
import { BadRequest } from 'src/common/exceptions';
import { getCurrentTimeInt } from 'src/common/utils/helper';

export class CoreEntity extends BaseEntity {
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

  save(): Promise<this> {
    if (!this.hasId()) {
      this.createdAt = getCurrentTimeInt();
    }
    this.updatedAt = getCurrentTimeInt();
    return super.save();
  }

  static async findOneOrThrowId<T extends BaseEntity>(
    this: ObjectType<T>,
    id?: string | number | Date,
    options?: FindOneOptions<T>,
    replaceName?: string,
  ): Promise<T> {
    try {
      let where: any = {};
      if (id) {
        where.id = id;
      }
      where = { ...where, ...options?.where };
      return await super.findOneOrFail<T>({
        where: where,
      });
    } catch (error) {
      console.log(error);
      throw new BadRequest(
        `${replaceName ? replaceName : this.name} không tồn tại.`,
      );
    }
  }

  static async findOneOrThrowOption<T extends BaseEntity>(
    this: ObjectType<T>,
    options?: FindOneOptions<T>,
    replaceName?: string,
  ): Promise<T> {
    try {
      return await super.findOneOrFail<T>(options!);
    } catch (error) {
      console.log(error);
      throw new BadRequest(
        `${replaceName ? replaceName : this.name} không tồn tại.`,
      );
    }
  }
}
