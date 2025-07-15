import { AccessTokenPayload } from '@common/types/interfaces/token-payload.interface';

declare module 'express' {
  export interface Request {
    user?: AccessTokenPayload;
  }
}
