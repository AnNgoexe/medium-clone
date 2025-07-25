import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import PrismaService from '@common/service/prisma.service';
import TokenService from '@common/service/token.service';
import PasswordService from '@common/service/password.service';
import {
  ERROR_USER_NOT_FOUND,
  ERROR_PASSWORD_INVALID,
  ERROR_USER_ALREADY_EXISTS,
} from '@common/constant/error.constant';
import { AccessTokenPayloadInput } from '@common/type/token-payload.interface';
import { User, UserResponse } from '@common/type/user-response.interface';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly i18n: I18nService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        bio: true,
        image: true,
      },
    });
    if (!user)
      throw new NotFoundException({
        ...ERROR_USER_NOT_FOUND,
        message: this.i18n.translate('auth.login.error.user_not_exists'),
      });

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException({
        ...ERROR_PASSWORD_INVALID,
        message: this.i18n.translate('auth.login.error.password_not_match'),
      });

    const token = await this.createAccessToken(user);
    return this.buildUserResponse(user, token);
  }

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<UserResponse> {
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true },
    });
    if (existingUser)
      throw new ConflictException({
        ...ERROR_USER_ALREADY_EXISTS,
        message: this.i18n.translate('auth.register.error.user_already_exists'),
      });

    const hashedPassword = await this.passwordService.hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        bio: '',
        image: '',
      },
      select: { id: true, email: true, username: true, bio: true, image: true },
    });
    const token = await this.createAccessToken(user);
    return this.buildUserResponse(user, token);
  }

  private async createAccessToken(
    user: Pick<User, 'email' | 'id' | 'username'>,
  ): Promise<string> {
    const payload: AccessTokenPayloadInput = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };
    return this.tokenService.generateAccessToken(payload);
  }

  private buildUserResponse(
    user: Omit<User, 'id' | 'password'>,
    token: string,
  ): UserResponse {
    return {
      user: {
        email: user.email,
        username: user.username,
        bio: user.bio || '',
        image: user.image || '',
        token,
      },
    };
  }
}
