import { CustomDecorator } from '@nestjs/common';
import { Auth } from './auth.decorator';
import { AuthType } from '@common/type/auth-type.enum';

/**
 * Optional auth — if token exists, validate; otherwise allow access
 * Equivalent to @Auth(AuthType.OPTIONAL)
 */
export const Optional = (): CustomDecorator => Auth(AuthType.OPTIONAL);
