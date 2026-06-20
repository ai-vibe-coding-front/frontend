import { NextResponse } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { loginSchema } from '@/features/auth/schemas/loginSchema';
import { login } from '@/server/services/auth-service';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('INVALID_INPUT', '요청 형식이 올바르지 않습니다', 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail('INVALID_INPUT', parsed.error.issues[0]?.message ?? '입력값을 확인해주세요', 400);
  }

  const { email, password } = parsed.data;

  try {
    const { user, accessToken, refreshToken } = await login(email, password);

    const response = ok({ user }) as NextResponse;

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1h
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 14, // 14일
      path: '/',
    });

    // 클라이언트에서 로그인 여부 확인용 (민감 정보 미포함)
    response.cookies.set('isLoggedIn', '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // accessToken과 동일한 만료
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'USER_NOT_FOUND') {
        return fail('USER_NOT_FOUND', '존재하지 않는 이메일입니다', 401);
      }
      if (error.message === 'INVALID_PASSWORD') {
        return fail('INVALID_PASSWORD', '비밀번호가 올바르지 않습니다', 401);
      }
    }
    console.error('[login]', error);
    return fail('INTERNAL_ERROR', '서버 오류가 발생했습니다', 500);
  }
}
