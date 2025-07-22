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
import { I18nService, I18nContext } from 'nestjs-i18n';

@Injectable()
export default class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
    private readonly i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authType: AuthType =
      this.reflector.get<AuthType>(AUTH_TYPE_KEY, context.getHandler()) ??
      AuthType.ACCESS_TOKEN;

    if (authType === AuthType.NONE) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest<Request>();
    const i18nContext = I18nContext.current(context);
    const lang = i18nContext?.lang || 'en';

    const authHeader = request.headers['authorization'];

    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      if (authType === AuthType.OPTIONAL) return true;
      throw new UnauthorizedException({
        ...ERROR_MISSING_AUTH_HEADER,
        message: this.i18n.translate('common.error.error_missing_auth_header', {
          lang,
        }),
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.tokenService.verifyAccessToken(token);

      const { userId, username, email } = payload;

      if (!userId) {
        throw new UnauthorizedException({
          ...ERROR_MISSING_USER_ID,
          message: this.i18n.translate('common.error.error_missing_user_id', {
            lang,
          }),
        });
      }

      if (!username) {
        throw new UnauthorizedException({
          ...ERROR_MISSING_USER_NAME,
          message: this.i18n.translate('common.error.error_missing_user_name', {
            lang,
          }),
        });
      }

      if (!email) {
        throw new UnauthorizedException({
          ...ERROR_MISSING_USER_EMAIL,
          message: this.i18n.translate(
            'common.error.error_missing_user_email',
            { lang },
          ),
        });
      }

      request['user'] = payload;
      return true;
    } catch (error) {
      if (authType === AuthType.OPTIONAL) return true;
      throw error;
    }
  }
}
