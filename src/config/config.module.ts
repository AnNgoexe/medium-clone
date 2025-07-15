import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import jwtConfig from '@config/jwt.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      cache: true,
      expandVariables: true,
      ignoreEnvFile: false,
      load: [jwtConfig],
    }),
  ],
})
export class ConfigModule {}
