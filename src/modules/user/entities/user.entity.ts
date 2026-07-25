import { CoreEntity } from 'src/base/CoreEntity';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class User extends CoreEntity {
  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  email: string;

  @Column({ default: '', select: false })
  password: string;
}
