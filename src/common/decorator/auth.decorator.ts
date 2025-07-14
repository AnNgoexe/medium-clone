import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { AuthType } from '@common/type/auth-type.enum';

export const AUTH_TYPE_KEY = 'auth_type';

/**
 * Main decorator to define required authentication type
 */
export const Auth = (type: AuthType = AuthType.ACCESS_TOKEN): CustomDecorator =>
  SetMetadata(AUTH_TYPE_KEY, type);
