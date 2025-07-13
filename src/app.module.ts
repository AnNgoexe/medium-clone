import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import LoggerMiddleware from '@common/middleware/logger.middleware';
import { ConfigModule } from '@config/config.module';

@Module({
  imports: [CommonModule, ConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
