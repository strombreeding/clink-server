import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 유효성 검사 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Clink API Documentation') // API 제목
    .setDescription('Clink 서비스 API 설명서') // API 설명
    .setVersion('1.0') // API 버전
    .addBearerAuth() // JWT 토큰 인증 설정 (선택 사항)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(8080);
}
bootstrap();
