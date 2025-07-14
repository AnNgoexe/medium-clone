import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/user.seed';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seeding...');
  await seedUsers();
  console.log('✅ Seeding complete!');
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
