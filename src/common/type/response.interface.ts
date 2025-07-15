export interface ResponsePayload<T = unknown> {
  message: string;
  data: T;
}

export interface Response<T extends ResponsePayload> {
  statusCode: number;

  timestamp: string;

  path: string;

  data?: T['data'] | object;

  error?: string;

  message?: T['message'] | string;

  errorCode?: string;
}
