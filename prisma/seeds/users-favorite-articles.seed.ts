import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedArticleFavorites(): Promise<void> {
  const articleFavoritesData = [
    {
      userId: 1,
      articleId: 1,
    },
    {
      userId: 2,
      articleId: 2,
    },
    {
      userId: 1,
      articleId: 3,
    },
    {
      userId: 2,
      articleId: 3,
    },
  ];

  await prisma.favorite.createMany({
    data: articleFavoritesData.map((item) => ({
      userId: item.userId,
      articleId: item.articleId,
    })),
    skipDuplicates: true,
  });
}
