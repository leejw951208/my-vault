// 전역 예외 필터. NestJS HttpException 및 일반 예외를 한국어 응답 형식으로 정규화한다.
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: '서버 내부 오류가 발생했습니다.' };

    const message =
      typeof payload === 'string'
        ? payload
        : Array.isArray((payload as { message?: unknown }).message)
          ? ((payload as { message: string[] }).message)
          : (payload as { message?: string }).message ?? '요청을 처리할 수 없습니다.';

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url} -> ${status}`, exception as Error);
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString()
    });
  }
}
