import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedArticleFavorites(): Promise<void> {
  const articleFavoritesData = [
    {
      userId: 1,
      slug: 'how-to-train-your-dragon',
    },
    {
      userId: 2,
      slug: 'health-benefits-of-exercise',
    },
    {
      userId: 1,
      slug: 'latest-sports-updates',
    },
    {
      userId: 2,
      slug: 'latest-sports-updates',
    },
  ];

  for (const item of articleFavoritesData) {
    await prisma.user.update({
      where: { id: item.userId },
      data: {
        articles: {
          connect: { slug: item.slug },
        },
      },
    });
  }
}
