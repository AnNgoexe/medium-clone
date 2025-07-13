import { Global, Module } from '@nestjs/common';
import LoggerService from '@common/service/logger.service';
import HttpExceptionFilter from '@common/filter/http-exception.filter';
import AllExceptionsFilter from '@common/filter/all-exception.filter';
import ResponseInterceptor from '@common/interceptor/response.interceptor';

const service = [LoggerService];

@Global()
@Module({
  imports: [],
  providers: [
    ...service,
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionsFilter,
    },
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionFilter,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
  ],
  exports: [...service],
})
export class CommonModule {}
