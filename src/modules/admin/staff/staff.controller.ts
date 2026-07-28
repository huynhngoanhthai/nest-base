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
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { CONFIG } from 'src/config/config';
import { JWTAuth, UserAuth } from 'src/common/decorators';
import { FindallDto } from './dto/findall.dto';

@ApiTags('admin - staff')
@Controller(`${CONFIG.API_PREFIX}/admin/staff`)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo mới staff' })
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @Get()
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách staff' })
  findAll(@Query() query: FindallDto) {
    return this.staffService.findAll(query);
  }

  @Get(':id')
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy chi tiết staff' })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(+id);
  }

  @Patch(':id')
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật staff' })
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(+id, updateStaffDto);
  }

  @Delete(':id')
  @UserAuth(JWTAuth)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa staff' })
  remove(@Param('id') id: string) {
    return this.staffService.remove(+id);
  }
}
