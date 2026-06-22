import { cookies } from 'next/headers';
import { z } from 'zod';
import { ok, fail } from '@/lib/api-response';
import {
  createGuestSession,
  generateSessionKey,
  checkGuestUsed,
  verifyAccessToken,
} from '@/server/services/exploration-session-service';

const locationSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  nx: z.number().int().optional(),
  ny: z.number().int().optional(),
  sido: z.string().optional(),
  address: z.string().optional(),
  stationName: z.string().optional(),
});

const bodySchema = z.object({
  location: locationSchema.optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('INVALID_INPUT', '요청 형식이 올바르지 않습니다', 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return fail('INVALID_INPUT', parsed.error.issues[0]?.message ?? '입력값을 확인해주세요', 400);
  }

  const cookieStore = await cookies();
  const isLoggedIn = await verifyAccessToken(cookieStore.get('accessToken')?.value);
  const existingKey = cookieStore.get('guestSessionKey')?.value;
  const sessionKey = existingKey ?? generateSessionKey();

  if (!isLoggedIn && existingKey) {
    const { hasUsed } = await checkGuestUsed(existingKey);
    if (hasUsed) {
      return fail('GUEST_SESSION_LIMIT_EXCEEDED', '비회원 체험 1회 제한을 초과했습니다', 403);
    }
  }

  try {
    const session = await createGuestSession(sessionKey, parsed.data.location ?? {});

    const response = ok({
      explorationSessionId: session.id,
      status: session.status,
      expiresAt: session.expiresAt,
    });

    if (!existingKey) {
      response.cookies.set('guestSessionKey', sessionKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30일
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('[exploration-sessions POST]', error);
    return fail('INTERNAL_ERROR', '서버 오류가 발생했습니다', 500);
  }
}
