export const ERROR_INTERNAL_SERVER = {
  statusCode: 500,
  error: 'Internal Server Error',
  message: 'An unexpected error occurred',
  errorCode: 'INTERNAL_SERVER_ERROR',
};

export const ERROR_ACCESS_TOKEN_EXPIRED = {
  statusCode: 401,
  error: 'Unauthorized',
  message: 'Access token expired',
  errorCode: 'ERROR_ACCESS_TOKEN_EXPIRED',
};

export const ERROR_INVALID_ACCESS_TOKEN = {
  statusCode: 401,
  error: 'Unauthorized',
  message: 'Invalid access token',
  errorCode: 'ERROR_INVALID_ACCESS_TOKEN',
};

export const ERROR_REFRESH_TOKEN_EXPIRED = {
  statusCode: 401,
  error: 'Unauthorized',
  message: 'Refresh token expired',
  errorCode: 'ERROR_REFRESH_TOKEN_EXPIRED',
};

export const ERROR_INVALID_REFRESH_TOKEN = {
  statusCode: 401,
  error: 'Unauthorized',
  message: 'Invalid refresh token',
  errorCode: 'ERROR_INVALID_REFRESH_TOKEN',
};

export const ERROR_UNKNOWN_ACCESS_TOKEN = {
  statusCode: 401,
  error: 'Unauthorized',
  message: 'Could not verify access token',
  errorCode: 'ERROR_UNKNOWN_ACCESS_TOKEN',
};

export const ERROR_UNKNOWN_REFRESH_TOKEN = {
  statusCode: 401,
  error: 'Unauthorized',
  message: 'Could not verify refresh token',
  errorCode: 'ERROR_UNKNOWN_REFRESH_TOKEN',
};

export const ERROR_MISSING_AUTH_HEADER = {
  statusCode: 401,
  error: 'Unauthorized',
  message: 'Missing or invalid Authorization header',
  errorCode: 'ERROR_MISSING_AUTH_HEADER',
};

export const ERROR_MISSING_USER_ID = {
  statusCode: 401,
  error: 'Unauthorized',
  message: 'Missing userId in token payload',
  errorCode: 'ERROR_MISSING_USER_ID',
};

export const ERROR_MISSING_USER_NAME = {
  statusCode: 401,
  error: 'Unauthorized',
  message: 'Missing username in token payload',
  errorCode: 'ERROR_MISSING_USER_NAME',
};

export const ERROR_MISSING_USER_EMAIL = {
  statusCode: 401,
  error: 'Unauthorized',
  message: 'Missing email in token payload',
  errorCode: 'ERROR_MISSING_USER_EMAIL',
};

export const ERROR_CLASS_VALIDATION_FAILED = {
  statusCode: 400,
  error: 'Bad Request',
  message: 'Class validation failed',
  errorCode: 'ERROR_CLASS_VALIDATION_FAILED',
};
