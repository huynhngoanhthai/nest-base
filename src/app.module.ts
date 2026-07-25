import { AuthModule } from './modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CONFIG } from './config/config';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: CONFIG.DATABASE.TYPE as 'mysql' | 'postgres' | 'mariadb',
      host: CONFIG.DATABASE.HOST,
      port: CONFIG.DATABASE.PORT,
      username: CONFIG.DATABASE.USERNAME,
      password: CONFIG.DATABASE.PASSWORD,
      database: CONFIG.DATABASE.DATABASE,
      autoLoadEntities: true,
      synchronize: CONFIG.DATABASE.SYNCHRONIZE,
      logging: CONFIG.DATABASE.LOGGING,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
