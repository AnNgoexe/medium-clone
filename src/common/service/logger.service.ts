import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export default class LoggerService extends ConsoleLogger {
  constructor(context: string) {
    super(context, {
      timestamp: true,
      colors: true,
      logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
      prefix: 'MyApplication',
    });
  }

  log(message: string, ...optionalParams: unknown[]): void {
    super.log(`[INFO] ${message}`, ...optionalParams);
  }

  error(message: string, ...optionalParams: unknown[]): void {
    super.error(`[ERROR] ${message}`, ...optionalParams);
  }

  debug(message: string, ...optionalParams: unknown[]): void {
    super.debug(`[DEBUG] ${message}`, ...optionalParams);
  }

  warn(message: string, ...optionalParams: unknown[]): void {
    super.warn(`[WARN] ${message}`, ...optionalParams);
  }

  verbose(message: string, ...optionalParams: unknown[]): void {
    super.verbose(`[VERBOSE] ${message}`, ...optionalParams);
  }
}
