import { registerAs } from '@nestjs/config';
import { z } from 'zod';

export const jwtConfigSchema = z.object({
  ACCESS_TOKEN_KEY: z.string().min(32),
  ACCESS_TOKEN_EXPIRES: z.string().default('1h'),
  REFRESH_TOKEN_KEY: z.string().min(32),
  REFRESH_TOKEN_EXPIRES: z.string().default('7d'),
});

export type JwtConfig = z.infer<typeof jwtConfigSchema>;

export default registerAs('jwt', () => {
  const config = {
    ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY,
    ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || '1h',
    REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY,
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  };

  return jwtConfigSchema.parse(config);
});
