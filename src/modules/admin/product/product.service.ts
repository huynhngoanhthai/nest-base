import { Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindallDto } from './dto/findall.dto';
import { ResponseAPI } from 'src/common/responses';

@Injectable()
export class ProductService {
  constructor() {}

  async create(createProductDto: CreateProductDto) {
    const item = createProductDto.product;
    await item.save();
    return ResponseAPI.sendOK(item);
  }

  async findAll(query: FindallDto) {
    const { search, page, limit } = query;
    let where = `product.isDeleted = false`;
    if (search) {
      where += ` AND CONCAT(product.name) LIKE :search`;
    }
    const [products, total] = await Product.createQueryBuilder('product')
      .where(where, {
        search: `%${search}%`,
      })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('product.id', 'DESC')
      .getManyAndCount();

    return ResponseAPI.sendOK({ products, total });
  }

  async findOne(id: number) {
    const item = await Product.findOneOrThrowId(id);
    return ResponseAPI.sendOK(item);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const item = updateProductDto.product;
    item.id = +id;
    await item.save();
    return ResponseAPI.sendOK(item);
  }

  async remove(id: number) {
    const item = new Product();
    item.id = +id;
    item.isDeleted = true;
    await item.save();
    return ResponseAPI.sendOK(item);
  }
}
