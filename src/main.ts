import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { CONFIG } from './config/config';
// import { BadRequestFilter } from './common/filters/bad-request.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // app.useGlobalFilters(new BadRequestFilter());

  // Default Swagger documentation at /api
  const defaultConfig = new DocumentBuilder()
    .setTitle('Tips App API')
    .setDescription('The Tips App API description')
    .setVersion(CONFIG.VERSION)
    .build();

  const defaultDocument = SwaggerModule.createDocument(app, defaultConfig);
  SwaggerModule.setup('docs', app, defaultDocument);

  await app.listen(CONFIG.PORT);
}

void bootstrap();
