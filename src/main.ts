import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CONFIG } from './config/config';
import { HandleError } from './common/error/HandleError';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Đăng ký Global Exception Filter để bắt toàn bộ lỗi, không làm dừng ứng dụng
  app.useGlobalFilters(new HandleError());

  // Cấu hình Swagger kèm Bearer Token JWT Auth
  const defaultConfig = new DocumentBuilder()
    .setTitle('Tips App API')
    .setDescription('The Tips App API description')
    .setVersion(CONFIG.VERSION)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Nhập JWT Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const defaultDocument = SwaggerModule.createDocument(app, defaultConfig);
  SwaggerModule.setup('docs', app, defaultDocument);

  await app.listen(CONFIG.PORT);
}

void bootstrap();
