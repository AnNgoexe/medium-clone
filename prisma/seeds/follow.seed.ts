// prisma/seed/seed-follow.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedFollows(): Promise<void> {
  const follows = [
    { followerId: 1, followingId: 2 },
    { followerId: 2, followingId: 1 },
  ];

  for (const { followerId, followingId } of follows) {
    // Lấy user follower
    await prisma.user.update({
      where: { id: followerId },
      data: {
        followings: {
          connect: { id: followingId },
        },
      },
    });
  }
}