import { cookies } from 'next/headers';
import { ok, fail } from '@/lib/api-response';
import { checkGuestUsed, verifyAccessToken } from '@/server/services/exploration-session-service';

export async function GET() {
  const cookieStore = await cookies();

  const isLoggedIn = await verifyAccessToken(cookieStore.get('accessToken')?.value);
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
