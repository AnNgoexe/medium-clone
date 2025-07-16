import { AccessTokenPayload } from '@common/type/token-payload.interface';

declare module 'express' {
  export interface Request {
    user?: AccessTokenPayload;
  }
}
