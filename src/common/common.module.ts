import { Global, Module } from '@nestjs/common';
import LoggerService from '@common/service/logger.service';
import HttpExceptionFilter from '@common/filter/http-exception.filter';
import AllExceptionsFilter from '@common/filter/all-exception.filter';
import ResponseInterceptor from '@common/interceptor/response.interceptor';
import TokenService from '@common/service/token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import JwtAuthGuard from '@common/guard/jwt-auth.guard';

const service = [LoggerService, TokenService];

@Global()
@Module({
  imports: [JwtModule, ConfigModule],
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
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
  ],
  exports: [...service],
})
export class CommonModule {}
