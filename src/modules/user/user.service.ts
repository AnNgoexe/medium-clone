import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PrismaService from '@common/service/prisma.service';
import PasswordService from '@common/service/password.service';
import UpdateUserBodyDto from '@modules/user/update-user.body.dto';
import {
  ERROR_EMAIL_ALREADY_EXISTS,
  ERROR_USER_NOT_FOUND,
  ERROR_USERNAME_ALREADY_EXISTS,
} from '@common/constant/error.constant';
import TokenService from '@common/service/token.service';
import { AccessTokenPayloadInput } from '@common/type/token-payload.interface';
import { User, UserResponse } from '@common/type/user-response.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserBodyDto,
  ): Promise<UserResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true },
    });

    if (!existingUser) {
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailExists) throw new ConflictException(ERROR_EMAIL_ALREADY_EXISTS);
    }

    if (
      updateUserDto.username &&
      updateUserDto.username !== existingUser.username
    ) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });
      if (usernameExists)
        throw new ConflictException(ERROR_USERNAME_ALREADY_EXISTS);
    }

    const data = updateUserDto;
    if (data.password) {
      data.password = await this.passwordService.hashPassword(data.password);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, username: true, bio: true, image: true },
    });

    const token: string = await this.createAccessToken(updatedUser);
    return this.buildUserResponse(updatedUser, token);
  }

  async getCurrentUser(userId: number): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, bio: true, image: true },
    });

    if (!user) throw new NotFoundException(ERROR_USER_NOT_FOUND);

    const token: string = await this.createAccessToken(user);
    return this.buildUserResponse(user, token);
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
}
