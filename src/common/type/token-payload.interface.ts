// Payload data required to create an Access Token.
export interface AccessTokenPayloadInput {
  userId: number;

  username: string;

  email: string;
}

// The decoded Access Token payload after verification.
export interface AccessTokenPayload extends AccessTokenPayloadInput {
  iat: number;

  exp: number;
}
