import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import LoggerService from '@common/service/logger.service';
import { Request, Response } from 'express';

@Catch(HttpException)
export default class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: LoggerService = new LoggerService(
    HttpExceptionFilter.name,
  );

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Example:
    // {
    //   "statusCode": 401,
    //   "error": "Unauthorized",
    //   "message": "Access token expired",
    //   "errorCode": "ERROR_ACCESS_TOKEN_EXPIRED",
    // }
    const errorMessage =
      typeof exceptionResponse === 'object'
        ? exceptionResponse
        : { message: exceptionResponse };

    this.logger.logJson(
      'HTTP Exception',
      {
        statusCode: status,
        ...errorMessage,
        path: request.url,
        exception: exception.stack,
      },
      'error',
    );

    response.status(status).json({
      ...errorMessage,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
