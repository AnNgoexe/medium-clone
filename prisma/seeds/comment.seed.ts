import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedComments(): Promise<void> {
  const commentsData = [
    {
      body: 'Great article about dragons!',
      authorId: 1,
      articleId: 1,
    },
    {
      body: 'I found this very helpful for my workout routine.',
      authorId: 2,
      articleId: 1,
    },
    {
      body: 'Exciting news in sports today!',
      authorId: 1,
      articleId: 3,
    },
    {
      body: 'Interesting trends in the entertainment industry.',
      authorId: 1,
      articleId: 4,
    },
  ];

  await prisma.comment.createMany({
    data: commentsData,
    skipDuplicates: true,
  });
}
