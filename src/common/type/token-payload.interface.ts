// Payload data required to create an Access Token.
export interface AccessTokenPayloadInput {
  // Unique identifier of the user
  userId: number;

  // Optional: Username for quick access in frontend without DB lookup
  username: string;

  // Optional: Email (nếu cần hiển thị trong UI)
  email: string;
}

// The decoded Access Token payload after verification.
export interface AccessTokenPayload extends AccessTokenPayloadInput {
  // Issued At - timestamp when token was issued
  iat: number;

  // Expiration time - timestamp when token expires
  exp: number;
}

// Payload data required to create a Refresh Token.
export interface RefreshTokenPayloadInput {
  // Unique identifier of the user
  userId: number;
}

// The decoded Refresh Token payload after verification.
export interface RefreshTokenPayload extends RefreshTokenPayloadInput {
  // Issued At timestamp
  iat: number;

  // Expiration timestamp
  exp: number;
}
