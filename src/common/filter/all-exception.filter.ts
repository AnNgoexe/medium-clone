import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import LoggerService from '@common/service/logger.service';
import { ERROR_INTERNAL_SERVER } from '@common/constant/error.constant';
import { Request, Response } from 'express';

@Catch()
export default class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger: LoggerService = new LoggerService(
    AllExceptionsFilter.name,
  );

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.logJson(
      'Unhandled Exception',
      {
        ...ERROR_INTERNAL_SERVER,
        path: request.url,
        exception,
      },
      'error',
    );

    response.status(status).json({
      ...ERROR_INTERNAL_SERVER,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
