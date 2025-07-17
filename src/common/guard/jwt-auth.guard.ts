import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import TokenService from '@common/service/token.service';
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
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authType: AuthType =
      this.reflector.get<AuthType>(AUTH_TYPE_KEY, context.getHandler()) ??
      AuthType.ACCESS_TOKEN;

    if (authType === AuthType.NONE) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      if (authType === AuthType.OPTIONAL) return true;
      throw new UnauthorizedException(ERROR_MISSING_AUTH_HEADER);
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.tokenService.verifyAccessToken(token);

      const { userId, username, email } = payload;

      if (!userId) {
        throw new UnauthorizedException(ERROR_MISSING_USER_ID);
      }

      if (!username) {
        throw new UnauthorizedException(ERROR_MISSING_USER_NAME);
      }

      if (!email) {
        throw new UnauthorizedException(ERROR_MISSING_USER_EMAIL);
      }

      request['user'] = payload;
      return true;
    } catch {
      if (authType === AuthType.OPTIONAL) return true;
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
