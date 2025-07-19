import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedArticleTags(): Promise<void> {
  const articleTags = [
    { slug: 'how-to-train-your-dragon', tagIds: [1, 2] },
    { slug: 'health-benefits-of-exercise', tagIds: [3, 4] },
    { slug: 'latest-sports-updates', tagIds: [4] },
    { slug: 'entertainment-industry-trends', tagIds: [5] },
  ];

  for (const { slug, tagIds } of articleTags) {
    await prisma.article.update({
      where: { slug },
      data: {
        tagList: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
    });
  }
}
