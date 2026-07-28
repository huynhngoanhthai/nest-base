import { ProductModule } from './product/product.module';
import { StaffModule } from './staff/staff.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [ProductModule, StaffModule],
  exports: [ProductModule, StaffModule],
})
export class AdminModule {}
