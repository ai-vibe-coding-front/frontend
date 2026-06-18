import { NextResponse } from 'next/server';

import type { ApiError, ApiSuccess } from '@/types/api';

export function ok<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: 200 },
  );
}

export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: 201 },
  );
}

/**
 * @example
 * return fail('INVALID_REQUEST', '요청값이 올바르지 않습니다.', 400, {
 *   field: 'email',
 * });
 */
export function fail(
  errorCode: string,
  message: string,
  status = 400,
  details?: unknown,
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      errorCode,
      message,
      ...(details === undefined ? {} : { details }),
    },
    { status },
  );
}
