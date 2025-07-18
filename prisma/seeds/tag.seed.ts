import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTags(): Promise<void> {
  const tags = ['news', 'technology', 'health', 'sports', 'entertainment'];

  await prisma.tag.createMany({
    data: tags.map((name) => ({ name })),
    skipDuplicates: true,
  });
}