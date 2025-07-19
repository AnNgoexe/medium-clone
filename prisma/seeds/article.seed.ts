import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedArticles(): Promise<void> {
  const articlesData = [
    {
      slug: 'how-to-train-your-dragon',
      title: 'How to train your dragon',
      description: 'Ever wonder how?',
      body: 'It takes a Jacobian',
      authorId: 1,
    },
    {
      slug: 'health-benefits-of-exercise',
      title: 'Health Benefits of Exercise',
      description: 'Why exercise is important',
      body: 'Regular exercise improves your health',
      authorId: 2,
    },
    {
      slug: 'latest-sports-updates',
      title: 'Latest Sports Updates',
      description: 'Today in sports news',
      body: 'Exciting matches happened today...',
      authorId: 1,
    },
    {
      slug: 'entertainment-industry-trends',
      title: 'Entertainment Industry Trends',
      description: 'What\'s new in entertainment',
      body: 'The entertainment industry is evolving rapidly...',
      authorId: 2,
    },
  ];

  await prisma.article.createMany({
    data: articlesData,
    skipDuplicates: true,
  });
}
