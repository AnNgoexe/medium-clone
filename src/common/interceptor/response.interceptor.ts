import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { catchError, map, Observable, throwError } from 'rxjs';
import LoggerService from '@common/service/logger.service';
import { Response, ResponsePayload } from '@common/type/response.interface';
import { Request } from 'express';

export default class ResponseInterceptor<T extends ResponsePayload>
  implements NestInterceptor<T, Response<T>>
{
  private readonly logger = new LoggerService(ResponseInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> | Promise<Observable<Response<T>>> {
    const request: Request = context.switchToHttp().getRequest();

    const now = Date.now();
    const { method, url } = request;
    this.logger.debug(`[${method}] ${url} - Request received`);

    return next.handle().pipe(
      map((res: T): Response<T> => {
        const formatted: Response<T> = this.handleSuccess(res, context);
        this.logger.debug(
          `[${method}] ${url} - Responded in ${Date.now() - now}ms`,
        );
        this.logger.logJson('Response', formatted, 'debug');
        return formatted;
      }),
      catchError((error: unknown) => {
        this.logger.error(`[${method}] ${url} - Error thrown`);
        return throwError(() => error); // Re-throw to let ExceptionFilter handle it
      }),
    );
  }

  private handleSuccess(res: T, context: ExecutionContext): Response<T> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response<T> = context.switchToHttp().getResponse();

    return {
      statusCode: response.statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: res['message'] || '',
      data: res['data'] || '',
    };
  }
}
