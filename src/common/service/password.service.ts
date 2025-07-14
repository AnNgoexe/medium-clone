import Logger from '@common/service/logger.service';
import * as bcrypt from 'bcrypt';

export default class PasswordService {
  private readonly saltRounds: number;
  private readonly logger: Logger;

  constructor(
    saltRounds: number = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  ) {
    this.saltRounds = saltRounds;
    this.logger = new Logger(PasswordService.name);
  }

  // Hashes a password using bcrypt with configured salt rounds.
  async hashPassword(password: string): Promise<string> {
    try {
      this.logger.debug(`Hashing password with ${this.saltRounds} salt rounds`);
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to hash password: ${errorMessage}`);
      throw new Error(
        `Failed to hash password: ${errorMessage} (Code: HASH_ERROR)`,
      );
    }
  }

  // Compares a plaintext password with a hashed password.
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      this.logger.debug('Comparing password');
      return await bcrypt.compare(password, hashedPassword);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to compare password: ${errorMessage}`);
      throw new Error(
        `Failed to compare password: ${errorMessage} (Code: COMPARE_ERROR)`,
      );
    }
  }
}
