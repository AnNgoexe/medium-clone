import { Global, Module } from '@nestjs/common';
import LoggerService from '@common/service/logger.service';
import HttpExceptionFilter from '@common/filter/http-exception.filter';
import AllExceptionsFilter from '@common/filter/all-exception.filter';

const service = [LoggerService];

@Global()
@Module({
  imports: [],
  providers: [
    ...service,
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionFilter,
    },
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [...service],
})
export class CommonModule {}
