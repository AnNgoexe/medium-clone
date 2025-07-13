import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import LoggerService from '@common/service/logger.service';

const bootstrapLogger = new LoggerService('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: new LoggerService('NestFactory'),
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap()
  .then(() => {
    bootstrapLogger.log(
      `Application is running on port ${process.env.PORT ?? 3000}`,
    );
  })
  .catch((error) => {
    bootstrapLogger.error('An error occurred', error);
    process.exit(1);
  });
