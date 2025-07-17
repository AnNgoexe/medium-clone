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

  private buildUserResponse(user: User, token: string): UserResponse {
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

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserBodyDto,
  ): Promise<UserResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new ConflictException(ERROR_EMAIL_ALREADY_EXISTS);
      }
    }

    if (
      updateUserDto.username &&
      updateUserDto.username !== existingUser.username
    ) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });
      if (usernameExists) {
        throw new ConflictException(ERROR_USERNAME_ALREADY_EXISTS);
      }
    }

    const data: Partial<UpdateUserBodyDto> = { ...updateUserDto };

    if (data.password) {
      data.password = await this.passwordService.hashPassword(data.password);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    const payload: AccessTokenPayloadInput = {
      userId: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
    };
    const token: string = await this.tokenService.generateAccessToken(payload);
    return this.buildUserResponse(updatedUser, token);
  }

  async getCurrentUser(userId: number): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    const payload: AccessTokenPayloadInput = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };
    const token: string = await this.tokenService.generateAccessToken(payload);
    return this.buildUserResponse(user, token);
  }

  async followUser(userId: number, username: string): Promise<object> {
    const userToFollow = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
        username: true,
        bio: true,
        image: true,
      },
    });

    if (!userToFollow) {
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    if (userToFollow.id === userId) {
      throw new ConflictException('You cannot follow yourself.');
    }

    const existingFollow = await this.prisma.user.findFirst({
      where: {
        id: userId,
        following: {
          some: {
            id: userToFollow.id,
          },
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('You are already following this user.');
    }

    await this.prisma.user.update({
      data: {
        following: {
          connect: { id: userToFollow.id },
        },
      },
      where: { id: userId },
    });

    return {
      message: `You are now following ${userToFollow.username}.`,
      data: {
        username: userToFollow.username,
        bio: userToFollow.bio,
        image: userToFollow.image,
        following: true,
      },
    };
  }

  async unfollowUser(userId: number, username: string): Promise<object> {
    const userToUnfollow = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
        username: true,
        bio: true,
        image: true,
      },
    });

    if (!userToUnfollow) {
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    if (userToUnfollow.id === userId) {
      throw new ConflictException('You cannot unfollow yourself.');
    }

    const existingFollow = await this.prisma.user.findFirst({
      where: {
        id: userId,
        following: {
          some: {
            id: userToUnfollow.id,
          },
        },
      },
    });

    if (!existingFollow) {
      throw new ConflictException('You are not following this user.');
    }

    await this.prisma.user.update({
      data: {
        following: {
          disconnect: { id: userToUnfollow.id },
        },
      },
      where: { id: userId },
    });

    return {
      message: `You have unfollowed ${userToUnfollow.username}.`,
      data: {
        username: userToUnfollow.username,
        bio: userToUnfollow.bio,
        image: userToUnfollow.image,
        following: false,
      },
    };
  }
}
