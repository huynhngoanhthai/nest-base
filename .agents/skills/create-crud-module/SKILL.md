---
name: create-crud-module
description: Architecture conventions and rules for generating CRUD modules matching the staff/product module pattern.
---

# CRUD Module Architecture Pattern

When creating or modifying CRUD modules in this repository (or using `script/create-CRUD.sh`), always strictly follow the established pattern below.

## Standard Module Structure

For any module (e.g. `feature` under `admin`):

### 1. Entity (`src/modules/admin/feature/entities/feature.entity.ts`)
```typescript
import { CoreEntity } from 'src/base/CoreEntity';
import { Column, Entity } from 'typeorm';

@Entity('features')
export class Feature extends CoreEntity {}
```

### 2. Create DTO (`src/modules/admin/feature/dto/create-feature.dto.ts`)
```typescript
import { Feature } from '../entities/feature.entity';

export class CreateFeatureDto {
  feature: Feature;
}
```

### 3. Update DTO (`src/modules/admin/feature/dto/update-feature.dto.ts`)
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateFeatureDto } from './create-feature.dto';
import { Feature } from '../entities/feature.entity';

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {
  feature: Feature;
}
```

### 4. Findall DTO (`src/modules/admin/feature/dto/findall.dto.ts`)
```typescript
export class FindallDto {
  search: string;
  page: number;
  limit: number;
}
```

### 5. Service (`src/modules/admin/feature/feature.service.ts`)
Uses ActiveRecord pattern and `ResponseAPI.sendOK`:
```typescript
import { Injectable } from '@nestjs/common';
import { Feature } from './entities/feature.entity';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { FindallDto } from './dto/findall.dto';
import { ResponseAPI } from 'src/common/responses';

@Injectable()
export class FeatureService {
  constructor() {}

  async create(createFeatureDto: CreateFeatureDto) {
    const item = createFeatureDto.feature;
    await item.save();
    return ResponseAPI.sendOK(item);
  }

  async findAll(query: FindallDto) {
    const { search, page, limit } = query;
    let where = `feature.isDeleted = false`;
    if (search) {
      where += ` AND CONCAT(feature.name) LIKE :search`;
    }
    const [features, total] = await Feature.createQueryBuilder('feature')
      .where(where, {
        search: `%${search}%`,
      })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('feature.id', 'DESC')
      .getManyAndCount();

    return ResponseAPI.sendOK({ features, total });
  }

  async findOne(id: number) {
    const item = await Feature.findOneOrThrowId(id);
    return ResponseAPI.sendOK(item);
  }

  async update(id: number, updateFeatureDto: UpdateFeatureDto) {
    const item = updateFeatureDto.feature;
    item.id = +id;
    await item.save();
    return ResponseAPI.sendOK(item);
  }

  async remove(id: number) {
    const item = new Feature();
    item.id = +id;
    item.isDeleted = true;
    await item.save();
    return ResponseAPI.sendOK(item);
  }
}
```

### 6. Controller (`src/modules/admin/feature/feature.controller.ts`)
```typescript
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
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { CONFIG } from 'src/config/config';
import { JWTAuth, UserAuth } from 'src/common/decorators';
import { FindallDto } from './dto/findall.dto';

@ApiTags('admin - feature')
@Controller(`${CONFIG.API_PREFIX}/admin/feature`)
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo mới feature' })
  create(@Body() createFeatureDto: CreateFeatureDto) {
    return this.featureService.create(createFeatureDto);
  }

  @Get()
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách feature' })
  findAll(@Query() query: FindallDto) {
    return this.featureService.findAll(query);
  }

  @Get(':id')
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy chi tiết feature' })
  findOne(@Param('id') id: string) {
    return this.featureService.findOne(+id);
  }

  @Patch(':id')
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật feature' })
  update(@Param('id') id: string, @Body() updateFeatureDto: UpdateFeatureDto) {
    return this.featureService.update(+id, updateFeatureDto);
  }

  @Delete(':id')
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa feature' })
  remove(@Param('id') id: string) {
    return this.featureService.remove(+id);
  }
}
```

## Controller-only Module (`script/create-controller.sh`)
For modules that only provide read/query controller functionality without full CRUD:
Generates `dto/findall.dto.ts`, single `@Get() findAll(@Query() query: FindallDto)` endpoint returning `ResponseAPI.sendOK([])`.
