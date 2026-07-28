import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AuthModule,],
  exports: [
    AuthModule,],
})
export class CustomerModule {}
