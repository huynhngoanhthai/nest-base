import { CoreEntity } from 'src/base/CoreEntity';
import { Column, Entity } from 'typeorm';

@Entity('staffs')
export class Staff extends CoreEntity {
  @Column({ default: '' })
  username: string;

  @Column({ default: '', select: false })
  password?: string;
}
