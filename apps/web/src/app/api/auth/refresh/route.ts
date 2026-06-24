import { cookies } from 'next/headers';
import { ok, fail } from '@/lib/api-response';
import { refreshTokens } from '@/server/services/auth-service';

export async function POST() {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('refreshToken')?.value;

  if (!cookieToken) {
    return fail('REFRESH_TOKEN_MISSING', '재발급에 필요한 토큰이 없습니다', 401);
  }

  try {
    const { user, accessToken, refreshToken } = await refreshTokens(cookieToken);

    const response = ok({ user });

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 14,
      path: '/',
    });

    response.cookies.set('isLoggedIn', '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'REFRESH_TOKEN_INVALID') {
        return fail('REFRESH_TOKEN_INVALID', '유효하지 않은 토큰입니다', 401);
      }
      if (error.message === 'REFRESH_TOKEN_REVOKED') {
        return fail('REFRESH_TOKEN_REVOKED', '이미 사용된 토큰입니다', 401);
      }
      if (error.message === 'REFRESH_TOKEN_EXPIRED') {
        return fail('REFRESH_TOKEN_EXPIRED', '만료된 토큰입니다. 다시 로그인해주세요', 401);
      }
      if (error.message === 'USER_NOT_FOUND') {
        return fail('USER_NOT_FOUND', '사용자를 찾을 수 없습니다', 404);
      }
    }
    console.error('[refresh]', error);
    return fail('TOKEN_REFRESH_FAILED', '서버 오류가 발생했습니다', 500);
  }
}
