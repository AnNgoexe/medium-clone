import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import LoggerMiddleware from '@common/middleware/logger.middleware';
import { ConfigModule } from '@config/config.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { ArticleModule } from '@modules/article/article.module';
import { ProfileModule } from '@modules/profile/profile.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule,
    AuthModule,
    UserModule,
    ArticleModule,
    ProfileModule,
  ],
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
