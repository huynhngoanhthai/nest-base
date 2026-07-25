import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { CONFIG } from 'src/config/config';
import { JWTAuth, UserAuth } from 'src/common/decorators';

@ApiTags('staff')
@Controller(`${CONFIG.API_PREFIX}/staff`)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @UserAuth(JWTAuth)
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @Get()
  @UserAuth(JWTAuth)
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  @UserAuth(JWTAuth)
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(+id);
  }

  @Patch(':id')
  @UserAuth(JWTAuth)
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(+id, updateStaffDto);
  }

  @Delete(':id')
  @UserAuth(JWTAuth)
  remove(@Param('id') id: string) {
    return this.staffService.remove(+id);
  }
}
