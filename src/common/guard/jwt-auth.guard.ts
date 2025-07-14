import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import TokenService from '@common/service/token.service';
import LoggerService from '@common/service/logger.service';
import { Reflector } from '@nestjs/core';
import {
  ERROR_MISSING_AUTH_HEADER,
  ERROR_MISSING_USER_ID,
  ERROR_MISSING_USER_NAME,
  ERROR_MISSING_USER_EMAIL,
} from '@common/constant/error.constant';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AUTH_TYPE_KEY } from '@common/decorator/auth.decorator';
import { AuthType } from '@common/type/auth-type.enum';

@Injectable()
export default class JwtAuthGuard implements CanActivate {
  private readonly logger = new LoggerService(JwtAuthGuard.name);

  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get metadata from the @Auth() or @Public() decorator
    const authType: AuthType =
      this.reflector.get<AuthType>(AUTH_TYPE_KEY, context.getHandler()) ??
      AuthType.ACCESS_TOKEN;

    // Skip authentication for public routes
    if (authType === AuthType.NONE) {
      this.logger.debug('Public route, skipping authentication');
      return true;
    }

    // Extract the incoming HTTP request object
    const request: Request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    // Validate that Authorization header exists and starts with expected scheme (e.g. 'Bearer ')
    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Missing or invalid Authorization header');
      throw new UnauthorizedException(ERROR_MISSING_AUTH_HEADER);
    }

    // Extract the token part from the header (e.g. after "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
      // Verify and decode the JWT access token
      const payload = await this.tokenService.verifyAccessToken(token);

      // Validate required fields in the token payload
      const { userId, username, email } = payload;

      if (!userId) {
        this.logger.warn('Missing userId in access token payload');
        throw new UnauthorizedException(ERROR_MISSING_USER_ID);
      }

      if (!username) {
        this.logger.warn('Missing username in access token payload');
        throw new UnauthorizedException(ERROR_MISSING_USER_NAME);
      }

      if (!email) {
        this.logger.warn('Missing email in access token payload');
        throw new UnauthorizedException(ERROR_MISSING_USER_EMAIL);
      }

      // Attach payload to request
      request['user'] = payload;
      this.logger.log('Access token verified and payload attached to request');

      // Authentication successful, allow request to proceed
      return true;
    } catch (error) {
      this.logger.warn('Access token verification failed', error);
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
