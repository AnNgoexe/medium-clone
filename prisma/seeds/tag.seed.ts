import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTags(): Promise<void> {
  const tags = ['news', 'technology', 'health', 'sports', 'entertainment'];

  for (const name of tags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}
