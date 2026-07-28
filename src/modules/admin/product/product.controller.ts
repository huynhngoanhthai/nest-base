import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CONFIG } from 'src/config/config';
import { JWTAuth, UserAuth } from 'src/common/decorators';
import { FindallDto } from './dto/findall.dto';

@ApiTags('admin - product')
@Controller(`${CONFIG.API_PREFIX}/admin/product`)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo mới product' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách product' })
  findAll(@Query() query: FindallDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy chi tiết product' })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật product' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa product' })
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
