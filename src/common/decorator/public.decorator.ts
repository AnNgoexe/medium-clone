import { Auth } from '@common/decorator/auth.decorator';
import { AuthType } from '@common/type/auth-type.enum';
import { CustomDecorator } from '@nestjs/common';

/**
 * Alias for public route (no authentication required)
 * Equivalent to @Auth(AuthType.NONE)
 */
export const Public = (): CustomDecorator => Auth(AuthType.NONE);
