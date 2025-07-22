import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ERROR_INTERNAL_SERVER } from '@common/constant/error.constant';
import { Request, Response } from 'express';
import { I18nService, I18nContext } from 'nestjs-i18n';

@Catch()
export default class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const i18nContext = I18nContext.current(host);

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = this.i18n.translate('error.internal_server_error', {
      lang: i18nContext?.lang || 'en',
    });

    response.status(status).json({
      ...ERROR_INTERNAL_SERVER,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
