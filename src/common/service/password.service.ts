import * as bcrypt from 'bcrypt';

export default class PasswordService {
  private readonly saltRounds: number;

  constructor(
    saltRounds: number = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  ) {
    this.saltRounds = saltRounds;
  }

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to hash password: ${errorMessage} (Code: HASH_ERROR)`,
      );
    }
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to compare password: ${errorMessage} (Code: COMPARE_ERROR)`,
      );
    }
  }
}
