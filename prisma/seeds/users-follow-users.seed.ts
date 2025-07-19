import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedFollows(): Promise<void> {
  const follows = [
    { userId: 1, followingId: 2 },
    { userId: 2, followingId: 1 },
  ];

  for (const { userId, followingId } of follows) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        followings: {
          connect: { id: followingId }
        }
      },
    });
  }
}