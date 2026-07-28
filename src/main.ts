import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CONFIG } from './config/config';
import { HandleError } from './common/error/HandleError';
import { AdminModule } from './modules/admin/admin.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Đăng ký Global Exception Filter để bắt toàn bộ lỗi, không làm dừng ứng dụng
  app.useGlobalFilters(new HandleError());

  // Cấu hình danh sách Docs và chỉ định các Module tương ứng với từng bộ Docs
  const swaggerConfigs = [
    {
      path: 'docs_admin',
      doc: '1. Docs Admin',
      specVersion: '3.0.1',
      include: [AdminModule], // Tự động lấy TẤT CẢ module trong AdminModule
    },
    {
      path: 'docs_customer',
      doc: '2. Docs Customer',
      specVersion: '3.0.1',
      include: [], // Tự động lấy TẤT CẢ module trong CustomerModule
    },
    {
      path: 'docs_public',
      doc: '3. Docs Public',
      specVersion: '3.0.1',
      include: [], // Tự động lấy TẤT CẢ module trong PublicModule
    },
  ];

  const swaggerUrls = swaggerConfigs.map((item) => ({
    url: `/${item.path}-json`,
    name: item.doc,
  }));

  // Tạo và đăng ký từng bộ Swagger Document tương ứng với từng module đã chọn
  swaggerConfigs.forEach((item) => {
    const config = new DocumentBuilder()
      .setTitle(`API ${item.doc.toUpperCase()}`)
      .setDescription(`Tài liệu API cho ${item.doc}`)
      .setVersion(item.specVersion)
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

    // Dùng { include: item.include } để CHỈ hiển thị API của các Module đã chỉ định
    const document = SwaggerModule.createDocument(app, config, {
      include: item.include,
    });

    SwaggerModule.setup(item.path, app, document, {
      explorer: true,
      swaggerOptions: {
        filter: true,
        urls: swaggerUrls,
      },
    });
  });

  await app.listen(CONFIG.PORT);
}

void bootstrap();
