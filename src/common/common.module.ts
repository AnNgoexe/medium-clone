import { Global, Module } from '@nestjs/common';
import LoggerService from '@common/service/logger.service';

const service = [LoggerService];

@Global()
@Module({
  imports: [],
  providers: [...service],
  exports: [...service],
})
export class CommonModule {}
