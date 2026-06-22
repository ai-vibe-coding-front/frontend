import { cookies } from 'next/headers';
import { ok, fail } from '@/lib/api-response';
import { checkGuestUsed } from '@/server/services/exploration-session-service';

export async function GET() {
  const cookieStore = await cookies();

  // httpOnly accessToken 쿠키로 로그인 여부 판단 (isLoggedIn은 위조 가능)
  const isLoggedIn = !!cookieStore.get('accessToken')?.value;
  if (isLoggedIn) {
    return ok({ hasUsed: false });
  }

  const sessionKey = cookieStore.get('guestSessionKey')?.value;
  if (!sessionKey) {
    return ok({ hasUsed: false });
  }

  try {
    const result = await checkGuestUsed(sessionKey);
    return ok(result);
  } catch (error) {
    console.error('[exploration-sessions/me GET]', error);
    return fail('INTERNAL_ERROR', '서버 오류가 발생했습니다', 500);
  }
}
