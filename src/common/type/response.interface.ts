export interface ResponsePayload<T = unknown> {
  message: string;
  data: T;
}

export interface Response<T extends ResponsePayload> {
  // HTTP status code (e.g., 200, 401, 422, 500)
  statusCode: number;

  // Timestamp of the response in ISO 8601 format
  timestamp: string;

  // The URL path of the incoming request
  path: string;

  // The response data when the request is successful
  data?: T['data'] | object;

  // Error name/title, present when response is an error
  error?: string;

  // Description message for success or error
  message?: T['message'] | string;

  // Custom error code identifier (e.g., "ERROR_INVALID_TOKEN")
  errorCode?: string;
}
