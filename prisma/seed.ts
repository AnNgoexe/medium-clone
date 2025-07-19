import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/user.seed';
import { seedTags } from './seeds/tag.seed';
import { seedArticles } from './seeds/article.seed';
import { seedFollows } from './seeds/users-follow-users.seed';
import { seedComments} from "./seeds/comment.seed";
import { seedArticleFavorites } from "./seeds/users-favorite-articles.seed";
import { seedArticleTags } from "./seeds/articles-have-tags.seed";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await seedUsers();
  await seedTags();
  await seedArticles();
  await seedFollows();
  await seedArticleFavorites();
  await seedArticleTags();
  await seedComments();
}

main()
  .catch((e) => {
    console.log('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Prisma disconnected.');
  });
