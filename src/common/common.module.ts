import { Global, Module } from '@nestjs/common';
import LoggerService from '@common/service/logger.service';
import HttpExceptionFilter from '@common/filter/http-exception.filter';
import AllExceptionsFilter from '@common/filter/all-exception.filter';
import ResponseInterceptor from '@common/interceptor/response.interceptor';
import TokenService from '@common/service/token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import JwtAuthGuard from '@common/guard/jwt-auth.guard';
import PrismaService from '@common/service/prisma.service';
import { CustomValidationPipe } from '@common/pipe/CustomValidationPipe';
import PasswordService from '@common/service/password.service';
import {
  I18nModule,
  AcceptLanguageResolver,
  I18nJsonLoader,
  QueryResolver,
  HeaderResolver,
  CookieResolver,
} from 'nestjs-i18n';
import * as path from 'path';

const service = [LoggerService, TokenService, PrismaService, PasswordService];

@Global()
@Module({
  imports: [
    JwtModule,
    ConfigModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      fallbacks: {
        'vi-*': 'vi',
        'en-*': 'en',
        'ja-*': 'ja',
      },
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(process.cwd(), 'src/i18n/'),
        watch: process.env.NODE_ENV !== 'production',
      },
      resolvers: [
        {
          use: QueryResolver,
          options: ['lang', 'locale'],
        },
        {
          use: HeaderResolver,
          options: ['x-lang', 'x-custom-lang'],
        },
        {
          use: CookieResolver,
          options: ['lang', 'locale'],
        },
        {
          use: AcceptLanguageResolver,
          options: ['en', 'vi', 'ja'],
        },
      ],
    }),
  ],
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
    {
      provide: 'APP_PIPE',
      useClass: CustomValidationPipe,
    },
  ],
  exports: [...service],
})
export class CommonModule {}
