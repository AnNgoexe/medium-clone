import { ConsoleLogger, Injectable } from '@nestjs/common';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

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

  logJson(
    label: string,
    data: unknown,
    level: 'log' | 'debug' | 'error' | 'warn' | 'verbose' = 'debug',
  ): void {
    const formattedJson = JSON.stringify(data, null, 2);
    const color = {
      log: colors.green,
      error: colors.red,
      debug: colors.magenta,
      warn: colors.yellow,
      verbose: colors.cyan,
    }[level];

    const formattedMessage = `${color} [${level.toUpperCase()}] ${label}:\n${formattedJson}${colors.reset}`;
    super[level](formattedMessage);
  }
}
