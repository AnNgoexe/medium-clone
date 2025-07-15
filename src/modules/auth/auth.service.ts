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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
  ) {}

  private async createAccessToken(user: {
    id: number;
    username: string;
    email: string;
  }): Promise<string> {
    const payload: AccessTokenPayloadInput = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };
    return this.tokenService.generateAccessToken(payload);
  }

  async validateUser(email: string, password: string): Promise<object> {
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
    if (!user) {
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }
    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_PASSWORD_INVALID);
    }
    const token = await this.createAccessToken(user);
    return {
      user: {
        email: user.email,
        username: user.username,
        bio: user.bio || null,
        image: user.image || null,
        token,
      },
    };
  }

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<object> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existingUser) {
      throw new ConflictException(ERROR_USER_ALREADY_EXISTS);
    }
    const hashedPassword = await this.passwordService.hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        bio: '',
        image: '',
      },
    });
    const token = await this.createAccessToken(user);
    return {
      user: {
        email: user.email,
        username: user.username,
        bio: user.bio || null,
        image: user.image || null,
        token,
      },
    };
  }
}
