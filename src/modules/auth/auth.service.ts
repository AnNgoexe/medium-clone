import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import PrismaService from '@common/service/prisma.service';
import TokenService from '@common/service/token.service';
import PasswordService from '@common/service/password.service';
import LoggerService from '@common/service/logger.service';
import {
  ERROR_USER_NOT_FOUND,
  ERROR_PASSWORD_INVALID,
} from '@common/constant/error.constant';
import {
  AccessTokenPayloadInput,
  RefreshTokenPayloadInput,
} from '@common/type/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly logger: LoggerService,
  ) {}

  // Method to validate user credentials
  async validateUser(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Validate input parameters
    this.logger.log(`Attempting login for email: ${email}`);
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        username: true,
      },
    });

    // Check if user exists
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    // Validate password
    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${email}`);
      throw new UnauthorizedException(ERROR_PASSWORD_INVALID);
    }

    // Prepare payloads for access and refresh tokens
    const accessTokenPayload: AccessTokenPayloadInput = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };
    const refreshTokenPayload: RefreshTokenPayloadInput = {
      userId: user.id,
    };

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      accessTokenPayload,
      refreshTokenPayload,
    );
    this.logger.log(`Login successful for user: ${user.username}`);
    return { accessToken, refreshToken };
  }

  // Generate access and refresh tokens for the user
  private async generateTokens(
    accessPayload: AccessTokenPayloadInput,
    refreshPayload: RefreshTokenPayloadInput,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(accessPayload),
      this.tokenService.generateRefreshToken(refreshPayload),
    ]);
    this.logger.debug('Tokens generated successfully');
    return { accessToken, refreshToken };
  }
}
