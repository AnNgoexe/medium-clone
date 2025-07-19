import PrismaService from '@common/service/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ERROR_ALREADY_FOLLOWING,
  ERROR_CANNOT_FOLLOW_SELF,
  ERROR_CANNOT_UNFOLLOW_SELF,
  ERROR_NOT_FOLLOWING_USER,
  ERROR_USER_NOT_FOUND,
} from '@common/constant/error.constant';
import {
  ProfileResponseData,
  ProfileResponse,
  Profile,
} from '@common/type/profile-response.interface';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(
    currentUserId: number | undefined,
    username: string,
  ): Promise<ProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, bio: true, image: true },
    });

    if (!user) {
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    const { id, ...profile } = user;

    const shouldCheckFollowing = currentUserId && currentUserId !== id;
    let following: boolean | undefined;

    if (shouldCheckFollowing) {
      const follow = await this.prisma.user.findFirst({
        where: {
          id: currentUserId,
          following: { some: { id: user.id } },
        },
      });

      following = !!follow;
    }
    return this.buildProfileResponse(
      shouldCheckFollowing ? { ...profile, following } : profile,
    );
  }

  async unfollowUser(
    userId: number,
    username: string,
  ): Promise<ProfileResponse> {
    const userToUnfollow = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, bio: true, image: true },
    });

    if (!userToUnfollow) {
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    const { id, ...profile } = userToUnfollow;

    if (id === userId) {
      throw new ConflictException(ERROR_CANNOT_UNFOLLOW_SELF);
    }

    const existingFollow = await this.prisma.user.findFirst({
      where: {
        id: userId,
        following: { some: { id: userToUnfollow.id } },
      },
    });

    if (!existingFollow) {
      throw new ConflictException(ERROR_NOT_FOLLOWING_USER);
    }

    await this.prisma.user.update({
      data: { following: { disconnect: { id: userToUnfollow.id } } },
      where: { id: userId },
    });

    return this.buildProfileResponse({
      ...profile,
      following: false,
    });
  }

  async followUser(userId: number, username: string): Promise<ProfileResponse> {
    const userToFollow: Profile | null = await this.prisma.user.findUnique({
      where: { username: username },
      select: { id: true, username: true, bio: true, image: true },
    });
    if (!userToFollow) {
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    const { id, ...profile } = userToFollow;

    if (id === userId) {
      throw new ConflictException(ERROR_CANNOT_FOLLOW_SELF);
    }

    const existingFollow = await this.prisma.user.findFirst({
      where: {
        id: userId,
        following: { some: { id: userToFollow.id } },
      },
    });

    if (existingFollow) {
      throw new ConflictException(ERROR_ALREADY_FOLLOWING);
    }

    await this.prisma.user.update({
      data: { following: { connect: { id: userToFollow.id } } },
      where: { id: userId },
    });

    return this.buildProfileResponse({
      ...profile,
      following: true,
    });
  }

  private buildProfileResponse(profile: ProfileResponseData): ProfileResponse {
    return { profile };
  }
}
