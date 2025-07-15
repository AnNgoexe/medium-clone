import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '@config/jwt.config';
import {
  AccessTokenPayload,
  AccessTokenPayloadInput,
} from '@common/type/token-payload.interface';
import * as jwt from 'jsonwebtoken';
import {
  ERROR_ACCESS_TOKEN_EXPIRED,
  ERROR_INVALID_ACCESS_TOKEN,
  ERROR_UNKNOWN_ACCESS_TOKEN,
} from '@common/constant/error.constant';

@Injectable()
export default class TokenService {
  private readonly accessTokenKey: string;
  private readonly accessTokenExpiresIn: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    const jwtConfig = this.configService.get<JwtConfig>('jwt');
    if (!jwtConfig) {
      throw new Error('JWT configuration is required');
    }
    this.accessTokenKey = jwtConfig.ACCESS_TOKEN_KEY;
    this.accessTokenExpiresIn = jwtConfig.ACCESS_TOKEN_EXPIRES;
  }

  async generateAccessToken(payload: AccessTokenPayloadInput): Promise<string> {
    try {
      return await this.jwtService.signAsync(payload, {
        secret: this.accessTokenKey,
        expiresIn: this.accessTokenExpiresIn,
        algorithm: 'HS256',
      });
    } catch {
      throw new Error('Failed to generate access token');
    }
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.accessTokenKey,
        algorithms: ['HS256'],
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(ERROR_ACCESS_TOKEN_EXPIRED);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(ERROR_INVALID_ACCESS_TOKEN);
      }
      throw new UnauthorizedException(ERROR_UNKNOWN_ACCESS_TOKEN);
    }
  }
}
