import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedArticles(): Promise<void> {
  const articlesData = [
    {
      slug: 'how-to-train-your-dragon',
      title: 'How to train your dragon',
      description: 'Ever wonder how?',
      body: 'It takes a Jacobian',
      isDraft: false,
      authorId: 1,
    },
    {
      slug: 'health-benefits-of-exercise',
      title: 'Health Benefits of Exercise',
      description: 'Why exercise is important',
      body: 'Regular exercise improves your health',
      isDraft: false,
      authorId: 2,
    },
    {
      slug: 'latest-sports-updates',
      title: 'Latest Sports Updates',
      description: 'Today in sports news',
      body: 'Exciting matches happened today...',
      isDraft: false,
      authorId: 1,
    },
    {
      slug: 'entertainment-industry-trends',
      title: 'Entertainment Industry Trends',
      description: 'What\'s new in entertainment',
      body: 'The entertainment industry is evolving rapidly...',
      isDraft: false,
      authorId: 2,
    },
    {
      slug: 'draft-ai-future',
      title: 'The Future of AI',
      description: 'Speculations on AI development',
      body: 'AI might take over the world or help us thrive.',
      authorId: 1,
    },
    {
      slug: 'draft-nutrition-guide',
      title: 'Nutrition Guide for 2025',
      description: 'Updated nutrition advice',
      body: 'New guidelines for a balanced diet.',
      authorId: 2,
    },
  ];

  await prisma.article.createMany({
    data: articlesData,
    skipDuplicates: true,
  });
}
