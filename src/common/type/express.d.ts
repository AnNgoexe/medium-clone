import { AccessTokenPayload } from '@common/types/interfaces/token-payload.interface';

// Extend Express's Request interface to include a custom 'user' field
// This allows attaching the decoded JWT payload to request.user
// and provides full type safety and IntelliSense support across the project.
declare module 'express' {
  export interface Request {
    user?: AccessTokenPayload;
  }
}
