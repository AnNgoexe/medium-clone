import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import jwtConfig from '@config/jwt.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      // Make ConfigModule global so it can be injected anywhere without importing repeatedly
      isGlobal: true,

      // Specify path(s) of environment files to load variables from
      envFilePath: ['.env'],

      // Cache the config values after first load for better performance
      cache: true,

      // Enable variable expansion in env files, e.g. DB_HOST=${HOST}
      expandVariables: true,

      // Whether to ignore loading environment files (.env), default is false
      ignoreEnvFile: false,

      // Load configuration objects registered via registerAs() under namespaces
      load: [jwtConfig],
    }),
  ],
})
export class ConfigModule {}
