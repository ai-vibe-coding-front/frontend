import { cookies } from 'next/headers';
import { z } from 'zod';
import { ok, fail } from '@/lib/api-response';
import { verifyAccessToken } from '@/server/services/auth-service';
import { decodeHtmlEntities, formatDate } from '@/server/services/event-service';
import {
  findRecommendationRunById,
  findFavoritedEventIds,
} from '@/server/repositories/recommendation-repository';

const paramsSchema = z.object({ runId: z.uuid() });

function ptyToWeatherType(
  pty: number | null,
  skyLabel: string | null,
): 'sunny' | 'cloudy' | 'rainy' | 'snowy' {
  if (pty === 2 || pty === 3) return 'snowy';
  if (pty != null && pty > 0) return 'rainy';
  if (skyLabel === '흐림' || skyLabel === '구름많음' || skyLabel === '구름조금') return 'cloudy';
  return 'sunny';
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return fail('INVALID_RUN_ID', '추천 실행 ID가 올바르지 않습니다.', 400);
  }
  const { runId } = parsed.data;

  try {
    const run = await findRecommendationRunById(runId);
    if (!run) {
      return fail('RECOMMENDATION_NOT_FOUND', '추천 결과를 찾을 수 없습니다.', 404);
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const loggedInUserId = accessToken ? await verifyAccessToken(accessToken) : null;

    // accessToken 만료 시 loggedInUserId는 null이며, findFavoritedEventIds가 빈 Set을 반환해
    // isFavorited: false로 일관되게 처리됨
    const favoritedIds = await findFavoritedEventIds(
      loggedInUserId,
      run.items.map((item) => item.eventItem.id),
    );

    return ok({
      runId: run.id,
      curation: run.curation,
      indoorForced: run.indoorForced,
      nearbyExpanded: run.nearbyExpanded,
      weather: run.weatherSnapshot
        ? {
            skyLabel: run.weatherSnapshot.skyLabel,
            pty: run.weatherSnapshot.pty,
            temperature: run.weatherSnapshot.temperature,
            type: ptyToWeatherType(run.weatherSnapshot.pty, run.weatherSnapshot.skyLabel),
          }
        : null,
      dust: run.weatherSnapshot
        ? {
            pm10Value: run.weatherSnapshot.pm10Value,
            pm10Grade: run.weatherSnapshot.pm10Grade,
            pm25Value: run.weatherSnapshot.pm25Value,
            pm25Grade: run.weatherSnapshot.pm25Grade,
          }
        : null,
      items: run.items.map((item) => ({
        rank: item.rank,
        score: item.score,
        distanceKm: item.distanceKm != null ? Math.round(item.distanceKm * 100) / 100 : null,
        isFavorited: favoritedIds.has(item.eventItem.id),
        eventItem: {
          id: item.eventItem.id,
          title: decodeHtmlEntities(item.eventItem.title),
          realmName: item.eventItem.realmName,
          place: item.eventItem.place ? decodeHtmlEntities(item.eventItem.place) : null,
          address: item.eventItem.address ? decodeHtmlEntities(item.eventItem.address) : null,
          lat: item.eventItem.lat,
          lng: item.eventItem.lng,
          startDate: formatDate(item.eventItem.startDate),
          endDate: formatDate(item.eventItem.endDate),
          price: item.eventItem.price,
          description: item.eventItem.description
            ? decodeHtmlEntities(item.eventItem.description)
            : null,
          imageUrl: item.eventItem.imageUrl,
          bookingUrl: item.eventItem.bookingUrl,
        },
      })),
    });
  } catch (err) {
    console.error('추천 결과 조회 실패', err);
    return fail('RECOMMENDATION_FETCH_FAILED', '추천 결과 조회에 실패했습니다.', 500);
  }
}
