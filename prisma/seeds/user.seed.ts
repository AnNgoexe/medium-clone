import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed initial user data into the database.
 *
 * This function inserts a predefined list of users into the database.
 * If a user with the same email already exists, it will skip creating a new user.
 * Passwords are securely hashed using bcrypt before being stored.
 */
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

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        username: user.username,
        password: hashedPassword,
        bio: user.bio,
        image: user.image,
      },
    });
  }
}
