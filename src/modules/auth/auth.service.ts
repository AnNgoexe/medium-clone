import {
  ConflictException,
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
  ERROR_USER_ALREADY_EXISTS,
} from '@common/constant/error.constant';
import { AccessTokenPayloadInput } from '@common/type/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly logger: LoggerService,
  ) {}

  // Private method để tạo access token từ user object
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

  // Method to validate user credentials
  async validateUser(email: string, password: string): Promise<object> {
    // Validate input parameters
    this.logger.log(`Attempting login for email: ${email}`);
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

    // Generate access and refresh tokens
    const token = await this.createAccessToken(user);
    this.logger.log(`Login successful for user: ${user.username}`);
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

  // Method to register a new user
  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<object> {
    this.logger.log(`Registering user with email: ${email}`);

    // Check if email or username already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      this.logger.warn(
        `User already exists with email or username: ${email} / ${username}`,
      );
      throw new ConflictException(ERROR_USER_ALREADY_EXISTS);
    }

    // Hash password before saving
    const hashedPassword = await this.passwordService.hashPassword(password);

    // Create new user
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
    this.logger.log(`User registered successfully: ${username}`);

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
