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

    let following: boolean | undefined;
    if (currentUserId && currentUserId !== id) {
      const isFollowing = await this.prisma.user.count({
        where: {
          id: currentUserId,
          followings: { some: { id } },
        },
      });
      following = isFollowing > 0;
    }
    return this.buildProfileResponse(
      following !== undefined ? { ...profile, following } : profile,
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

    const isFollowing = await this.prisma.user.count({
      where: {
        id: userId,
        followings: { some: { id: userToUnfollow.id } },
      },
    });
    if (isFollowing === 0) {
      throw new ConflictException(ERROR_NOT_FOLLOWING_USER);
    }

    await this.prisma.user.update({
      data: { followings: { disconnect: { id: userToUnfollow.id } } },
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

    const isAlreadyFollowing = await this.prisma.user.count({
      where: {
        id: userId,
        followings: { some: { id: userToFollow.id } },
      },
    });
    if (isAlreadyFollowing > 0) {
      throw new ConflictException(ERROR_ALREADY_FOLLOWING);
    }

    await this.prisma.user.update({
      data: { followings: { connect: { id: userToFollow.id } } },
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
