import { Injectable, NestMiddleware } from '@nestjs/common';
import LoggerService from '@common/service/logger.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export default class LoggerMiddleware implements NestMiddleware {
  private readonly logger: LoggerService = new LoggerService(
    LoggerMiddleware.name,
  );

  use(req: Request, res: Response, next: NextFunction): void {
    this.logger.log(`Incoming Request: [${req.method}] ${req.originalUrl}`);

    res.on('finish', () => {
      this.logger.log(
        `Response: [${req.method}] ${req.originalUrl} - Status: ${res.statusCode}`,
      );
    });

    next();
  }
}
