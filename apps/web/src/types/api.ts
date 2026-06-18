export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  errorCode: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
