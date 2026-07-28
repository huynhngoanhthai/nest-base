import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { Product } from '../entities/product.entity';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  product: Product;
}
