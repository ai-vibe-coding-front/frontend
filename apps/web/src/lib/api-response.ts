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

export function fail(
  code: string,
  message: string,
  status = 400,
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      code,
      message,
    },
    { status },
  );
}
