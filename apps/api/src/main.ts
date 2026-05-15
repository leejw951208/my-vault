// NestJS 진입점. 127.0.0.1:4000 바인딩과 CORS, 검증 파이프, 예외 필터를 설정한다.
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  // DATABASE_URL 누락 시 명시적 한국어 에러로 즉시 종료한다.
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
    Logger.error(
      'DATABASE_URL 환경 변수가 설정되어 있지 않습니다. apps/api/.env.example을 참고해 .env 파일을 만들어주세요.',
      'Bootstrap'
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://127.0.0.1:3000',
    credentials: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(4000, '127.0.0.1');
}

bootstrap();
