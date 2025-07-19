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

export const ERROR_UNKNOWN_ACCESS_TOKEN = {
  statusCode: 401,
  error: 'Unauthorized',
  message: 'Could not verify access token',
  errorCode: 'ERROR_UNKNOWN_ACCESS_TOKEN',
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

export const ERROR_USER_NOT_FOUND = {
  statusCode: 404,
  error: 'Not Found',
  message: 'User not found',
  errorCode: 'ERROR_USER_NOT_FOUND',
};

export const ERROR_PASSWORD_INVALID = {
  statusCode: 401,
  error: 'Unauthorized',
  message: 'Invalid password',
  errorCode: 'ERROR_PASSWORD_INVALID',
};

export const ERROR_USER_ALREADY_EXISTS = {
  statusCode: 409,
  error: 'Conflict',
  message: 'User with this email or username already exists',
};

export const ERROR_EMAIL_ALREADY_EXISTS = {
  statusCode: 409,
  error: 'Conflict',
  message: 'Email is already in use',
  errorCode: 'ERROR_EMAIL_ALREADY_EXISTS',
};

export const ERROR_ALREADY_FAVORITED = {
  statusCode: 409,
  error: 'Conflict',
  message: 'You have already favorited this article',
  errorCode: 'ERROR_ALREADY_FAVORITED',
};

export const ERROR_NOT_FAVORITED_YET = {
  statusCode: 409,
  error: 'Conflict',
  message: 'You have not favorited this article yet',
  errorCode: 'ERROR_NOT_FAVORITED_YET',
};

export const ERROR_USERNAME_ALREADY_EXISTS = {
  statusCode: 409,
  error: 'Conflict',
  message: 'Username is already in use',
  errorCode: 'ERROR_USERNAME_ALREADY_EXISTS',
};

export const ERROR_COMMENT_NOT_FOUND = {
  statusCode: 404,
  error: 'Not Found',
  message: 'Comment not found',
  errorCode: 'ERROR_COMMENT_NOT_FOUND',
};

export const ERROR_FORBIDDEN_DELETE_COMMENT = {
  statusCode: 403,
  error: 'Forbidden',
  message: 'You are not the author of this comment',
  errorCode: 'ERROR_FORBIDDEN_DELETE_COMMENT',
};

export const ERROR_ARTICLE_NOT_FOUND = {
  statusCode: 404,
  error: 'Not Found',
  message: 'Article not found',
  errorCode: 'ERROR_ARTICLE_NOT_FOUND',
};

export const ERROR_INVALID_SLUG = {
  statusCode: 400,
  error: 'Bad Request',
  message: 'Slug cannot be empty or invalid',
  errorCode: 'ERROR_INVALID_SLUG',
};

export const ERROR_FORBIDDEN_DELETE_ARTICLE = {
  statusCode: 403,
  error: 'Forbidden',
  message: 'You are not the author of this article',
  errorCode: 'ERROR_FORBIDDEN_DELETE_ARTICLE',
};

export const ERROR_FORBIDDEN_UPDATE_ARTICLE = {
  statusCode: 403,
  error: 'Forbidden',
  message: 'You are not the author of this article',
  errorCode: 'ERROR_FORBIDDEN_UPDATE_ARTICLE',
};

export const ERROR_ARTICLE_CONFLICT = {
  statusCode: 409,
  error: 'Conflict',
  message: 'Article with this slug already exists',
  errorCode: 'ERROR_ARTICLE_CONFLICT',
};

export const ERROR_CANNOT_FOLLOW_SELF = {
  statusCode: 409,
  error: 'Conflict',
  message: 'You cannot follow yourself.',
  errorCode: 'ERROR_CANNOT_FOLLOW_SELF',
};

export const ERROR_ALREADY_FOLLOWING = {
  statusCode: 409,
  error: 'Conflict',
  message: 'You are already following this user.',
  errorCode: 'ERROR_ALREADY_FOLLOWING',
};

export const ERROR_CANNOT_UNFOLLOW_SELF = {
  statusCode: 409,
  error: 'Conflict',
  message: 'You cannot unfollow yourself.',
  errorCode: 'ERROR_CANNOT_UNFOLLOW_SELF',
};

export const ERROR_NOT_FOLLOWING_USER = {
  statusCode: 409,
  error: 'Conflict',
  message: 'You are not following this user.',
  errorCode: 'ERROR_NOT_FOLLOWING_USER',
};
