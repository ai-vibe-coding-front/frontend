import { cookies } from 'next/headers';
import { ok, fail } from '@/lib/api-response';
import { refreshTokens, REFRESH_ERRORS } from '@/server/services/auth-service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function POST() {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('refreshToken')?.value;

  if (!cookieToken) {
    return fail('REFRESH_TOKEN_MISSING', '다시 로그인이 필요합니다.', 401);
  }

  try {
    const { user, accessToken, refreshToken } = await refreshTokens(cookieToken);

    const response = ok({ user });

    response.cookies.set('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 60 * 60 });
    response.cookies.set('refreshToken', refreshToken.token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 14 });
    response.cookies.set('isLoggedIn', '1', { ...COOKIE_OPTIONS, httpOnly: false, maxAge: 60 * 60 });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === REFRESH_ERRORS.INVALID) {
        return fail(REFRESH_ERRORS.INVALID, '다시 로그인이 필요합니다.', 401);
      }
      if (error.message === REFRESH_ERRORS.REVOKED) {
        return fail(REFRESH_ERRORS.REVOKED, '다시 로그인이 필요합니다.', 401);
      }
      if (error.message === REFRESH_ERRORS.EXPIRED) {
        return fail(REFRESH_ERRORS.EXPIRED, '로그인 시간이 만료되었습니다.', 401);
      }
      if (error.message === REFRESH_ERRORS.USER_NOT_FOUND) {
        return fail(REFRESH_ERRORS.USER_NOT_FOUND, '다시 로그인이 필요합니다.', 401);
      }
    }
    console.error('[refresh]', error);
    return fail('TOKEN_REFRESH_FAILED', '인증 세션 갱신에 실패했습니다.', 500);
  }
}
