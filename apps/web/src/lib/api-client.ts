import type { ApiError, ApiResponse } from '@/types/api';

const UNKNOWN_ERROR_CODE = 'UNKNOWN_ERROR';
const UNKNOWN_ERROR_MESSAGE = '요청을 처리하는 중 오류가 발생했습니다.';

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(error: ApiError, status: number) {
    super(error.message);
    this.name = 'ApiClientError';
    this.code = error.code;
    this.status = status;
  }
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (typeof value !== 'object' || value === null || !('success' in value)) {
    return false;
  }

  if (value.success === true) {
    return 'data' in value;
  }

  return (
    value.success === false &&
    'code' in value &&
    typeof value.code === 'string' &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

function createUnknownError(status: number): ApiClientError {
  return new ApiClientError(
    {
      success: false,
      code: UNKNOWN_ERROR_CODE,
      message: UNKNOWN_ERROR_MESSAGE,
    },
    status,
  );
}

/**
 * @example
 * const user = await apiClient<User>('/api/users/me');
 */
export async function apiClient<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
    cache: init.cache ?? 'no-store',
  });

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw createUnknownError(response.status);
  }

  if (!isApiResponse<T>(body)) {
    throw createUnknownError(response.status);
  }

  if (!response.ok || !body.success) {
    const error: ApiError = body.success
      ? {
          success: false,
          code: UNKNOWN_ERROR_CODE,
          message: UNKNOWN_ERROR_MESSAGE,
        }
      : body;

    throw new ApiClientError(error, response.status);
  }

  return body.data;
}
