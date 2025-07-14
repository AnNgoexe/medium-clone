import { Injectable, UnauthorizedException } from '@nestjs/common';
import LoggerService from '@common/service/logger.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '@config/jwt.config';
import {
  AccessTokenPayload,
  AccessTokenPayloadInput,
  // RefreshTokenPayload,
  // RefreshTokenPayloadInput,
} from '@common/type/token-payload.interface';
import * as jwt from 'jsonwebtoken';
import {
  ERROR_ACCESS_TOKEN_EXPIRED,
  ERROR_INVALID_ACCESS_TOKEN,
  // ERROR_INVALID_REFRESH_TOKEN,
  // ERROR_REFRESH_TOKEN_EXPIRED,
  ERROR_UNKNOWN_ACCESS_TOKEN,
  // ERROR_UNKNOWN_REFRESH_TOKEN,
} from '@common/constant/error.constant';

@Injectable()
export default class TokenService {
  private readonly accessTokenKey: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenKey: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.logger = new LoggerService(TokenService.name);

    const jwtConfig = this.configService.get<JwtConfig>('jwt');
    if (!jwtConfig) {
      this.logger.error('JWT configuration is missing');
      throw new Error('JWT configuration is required');
    }

    this.accessTokenKey = jwtConfig.ACCESS_TOKEN_KEY;
    this.accessTokenExpiresIn = jwtConfig.ACCESS_TOKEN_EXPIRES;
    this.refreshTokenKey = jwtConfig.REFRESH_TOKEN_KEY;
    this.refreshTokenExpiresIn = jwtConfig.REFRESH_TOKEN_EXPIRES;

    this.logger.log('JWT configuration loaded:');
    this.logger.logJson('JWT config values (masked)', {
      ACCESS_TOKEN_KEY: this.accessTokenKey
        ? '*'.repeat(this.accessTokenKey.length)
        : null,
      ACCESS_TOKEN_EXPIRES: this.accessTokenExpiresIn || null,
      REFRESH_TOKEN_KEY: this.refreshTokenKey
        ? '*'.repeat(this.refreshTokenKey.length)
        : null,
      REFRESH_TOKEN_EXPIRES: this.refreshTokenExpiresIn || null,
    });
  }

  // Generate a signed access token with given payload
  async generateAccessToken(payload: AccessTokenPayloadInput): Promise<string> {
    try {
      this.logger.log('Generating Access Token...');
      const token = await this.jwtService.signAsync(payload, {
        secret: this.accessTokenKey,
        expiresIn: this.accessTokenExpiresIn,
        algorithm: 'HS256',
      });
      this.logger.log('Access Token generated successfully');
      return token;
    } catch (error) {
      this.logger.error('Error generating access token', error);
      throw new Error('Failed to generate access token');
    }
  }

  // Generate a signed refresh token with given payload
  // async generateRefreshToken(
  //   payload: RefreshTokenPayloadInput,
  // ): Promise<string> {
  //   try {
  //     this.logger.log('Generating Refresh Token...');
  //     const token = await this.jwtService.signAsync(payload, {
  //       secret: this.refreshTokenKey,
  //       expiresIn: this.refreshTokenExpiresIn,
  //       algorithm: 'HS256',
  //     });
  //     this.logger.log('Refresh Token generated successfully');
  //     return token;
  //   } catch (error) {
  //     this.logger.error('Error generating refresh token', error);
  //     throw new Error('Failed to generate refresh token');
  //   }
  // }

  // Verify access token and return decoded payload
  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      this.logger.log('Verifying Access Token...');
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        {
          secret: this.accessTokenKey,
          algorithms: ['HS256'],
        },
      );
      this.logger.log('Access Token verified successfully');
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.logger.error('Access Token expired');
        throw new UnauthorizedException(ERROR_ACCESS_TOKEN_EXPIRED);
      }

      if (error instanceof jwt.JsonWebTokenError) {
        this.logger.error('Invalid Access Token');
        throw new UnauthorizedException(ERROR_INVALID_ACCESS_TOKEN);
      }

      this.logger.error('Unexpected error verifying Access Token', error);
      throw new UnauthorizedException(ERROR_UNKNOWN_ACCESS_TOKEN);
    }
  }

  // Verify refresh token and return decoded payload
  // async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  //   try {
  //     this.logger.log('Verifying Refresh Token...');
  //     const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
  //       token,
  //       {
  //         secret: this.refreshTokenKey,
  //         algorithms: ['HS256'],
  //       },
  //     );
  //     this.logger.log('Refresh Token verified successfully');
  //     return payload;
  //   } catch (error) {
  //     if (error instanceof jwt.TokenExpiredError) {
  //       this.logger.error('Refresh Token expired');
  //       throw new UnauthorizedException(ERROR_REFRESH_TOKEN_EXPIRED);
  //     }
  //
  //     if (error instanceof jwt.JsonWebTokenError) {
  //       this.logger.error('Invalid Refresh Token');
  //       throw new UnauthorizedException(ERROR_INVALID_REFRESH_TOKEN);
  //     }
  //
  //     this.logger.error('Unexpected error verifying Refresh Token', error);
  //     throw new UnauthorizedException(ERROR_UNKNOWN_REFRESH_TOKEN);
  //   }
  // }
}
