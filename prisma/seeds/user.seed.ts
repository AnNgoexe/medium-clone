import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedUsers(): Promise<void> {
  const users = [
    {
      email: 'quocan2004tp@gmail.com',
      username: 'AnNgo',
      password: 'An12345@',
      bio: 'I am An',
      image: '',
    },
    {
      email: '22026515@vnu.edu.vn',
      username: 'An22026515',
      password: 'An23052004.',
      bio: 'I am An-22026515',
      image: '',
    },
  ];

  const usersHashed = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 10),
    }))
  );

  await prisma.user.createMany({
    data: usersHashed.map(({ email, username, password, bio, image }) => ({
      email,
      username,
      password,
      bio,
      image,
    })),
    skipDuplicates: true,
  });
}
