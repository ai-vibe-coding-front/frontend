import { cookies } from 'next/headers';
import { ok, fail } from '@/lib/api-response';
import { nearbyEventsSchema } from '@/features/events/schemas/nearbyEventsSchema';
import { findNearbyEvents } from '@/server/services/event-service';
import { verifyAccessToken } from '@/server/services/auth-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsed = nearbyEventsSchema.safeParse({
    lat: searchParams.get('lat') ?? undefined,
    lng: searchParams.get('lng') ?? undefined,
    radiusKm: searchParams.get('radiusKm') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    category: searchParams.get('category') ?? undefined,
  });

  if (!parsed.success) {
    return fail('INVALID_LOCATION', '위치 정보가 올바르지 않습니다.', 400);
  }

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const userId = accessToken ? await verifyAccessToken(accessToken) : null;

    const result = await findNearbyEvents({ ...parsed.data, userId });

    if (result.items.length === 0) {
      return fail('NEARBY_EVENTS_NOT_FOUND', '주변 행사가 없습니다.', 404);
    }

    return ok(result);
  } catch (err) {
    console.error('주변 행사 조회 실패', err);
    return fail('NEARBY_EVENTS_FETCH_FAILED', '주변 행사 조회에 실패했습니다.', 500);
  }
}
