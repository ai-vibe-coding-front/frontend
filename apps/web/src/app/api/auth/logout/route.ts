import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import { fail, ok } from '@/lib/api-response';
import { revokeRefreshToken } from '@/server/repositories/user-repository';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 0,
  path: '/',
};

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!accessToken && !refreshToken) {
    return fail('UNAUTHORIZED', '이미 로그아웃된 상태입니다.', 401);
  }

  try {
    if (refreshToken) {
      const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
      await revokeRefreshToken(tokenHash);
    }

    const response = ok(null);
    response.cookies.set('accessToken', '', COOKIE_OPTIONS);
    response.cookies.set('refreshToken', '', COOKIE_OPTIONS);
    response.cookies.set('isLoggedIn', '', {
      ...COOKIE_OPTIONS,
      httpOnly: false,
    });

    return response;
  } catch (error) {
    console.error('[logout]', error);
    return fail('LOGOUT_FAILED', '로그아웃에 실패했습니다.', 500);
  }
}
