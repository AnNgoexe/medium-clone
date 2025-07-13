import { registerAs } from '@nestjs/config';
import { z } from 'zod';
import LoggerService from '@common/service/logger.service';

// Initialize a logger instance with context for better traceability
const logger = new LoggerService('JwtConfig');

// Define Zod schema to validate JWT-related environment variables
export const jwtConfigSchema = z.object({
  ACCESS_TOKEN_KEY: z.string().min(32),
  ACCESS_TOKEN_EXPIRES: z.string().default('1h'),
  REFRESH_TOKEN_KEY: z.string().min(32),
  REFRESH_TOKEN_EXPIRES: z.string().default('7d'),
});

// Export the inferred TypeScript type for reuse
export type JwtConfig = z.infer<typeof jwtConfigSchema>;

// Export the configuration using NestJS's registerAs()
// This allows it to be loaded under the 'jwt' namespace
export default registerAs('jwt', () => {
  logger.log('Loading JWT configuration...');

  // Read raw environment variables and apply defaults where applicable
  const config = {
    ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY,
    ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || '1h',
    REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY,
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  };

  try {
    // Validate configuration using Zod schema
    const validatedConfig = jwtConfigSchema.parse(config);
    logger.log('JWT configuration validated successfully');

    // Log the validated config with masked sensitive keys
    logger.logJson('JWT config loaded (masked)', {
      ACCESS_TOKEN_KEY: '*'.repeat(validatedConfig.ACCESS_TOKEN_KEY.length),
      ACCESS_TOKEN_EXPIRES: validatedConfig.ACCESS_TOKEN_EXPIRES,
      REFRESH_TOKEN_KEY: '*'.repeat(validatedConfig.REFRESH_TOKEN_KEY.length),
      REFRESH_TOKEN_EXPIRES: validatedConfig.REFRESH_TOKEN_EXPIRES,
    });

    return validatedConfig;
  } catch (error) {
    // Log validation errors with details
    logger.error('JWT config validation failed', error);
    throw error;
  }
});
