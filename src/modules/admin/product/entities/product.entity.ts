import { CoreEntity } from 'src/base/CoreEntity';
import { Entity } from 'typeorm';

@Entity('products')
export class Product extends CoreEntity {}
