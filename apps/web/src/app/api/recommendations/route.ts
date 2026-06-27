import { cookies } from 'next/headers';
import { z } from 'zod';
import { ok, fail } from '@/lib/api-response';
import { getWeather } from '@/lib/weatherApi';
import { getDust } from '@/lib/dustApi';
import { verifyAccessToken } from '@/server/services/auth-service';
import { findExplorationSessionById } from '@/server/repositories/exploration-session-repository';
import {
  findRecommendationCandidates,
  saveRecommendation,
  findFavoritedEventIds,
} from '@/server/repositories/recommendation-repository';
import {
  checkIndoorForced,
  scoreAndRankEvents,
  filterAndSort,
  buildCurationMessage,
} from '@/server/services/recommendation-service';

const bodySchema = z
  .object({
    sessionId: z.string().uuid(),
    answers: z
      .array(
        z.discriminatedUnion('questionKey', [
          z.object({
            questionKey: z.literal('q1'),
            answerValue: z.enum(['high', 'medium', 'low']),
          }),
          z.object({
            questionKey: z.literal('q2'),
            answerValue: z.enum(['warmth', 'touched', 'recharge', 'thrill', 'stimulate']),
          }),
          z.object({
            questionKey: z.literal('q3'),
            answerValue: z.enum([
              'performance',
              'music',
              'exhibition',
              'experience',
              'festival',
              'any',
            ]),
          }),
          z.object({
            questionKey: z.literal('q4'),
            answerValue: z.enum(['alone', 'special', 'group', 'family']),
          }),
        ]),
      )
      .length(4)
      .refine((arr) => new Set(arr.map((a) => a.questionKey)).size === 4, {
        message: 'Each questionKey must appear exactly once',
      }),
  });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('INVALID_ANSWERS', '요청 형식이 올바르지 않습니다.', 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return fail('INVALID_ANSWERS', '답변 형식이 올바르지 않습니다.', 400);
  }

  const { sessionId, answers } = parsed.data;

  const cookieStore = await cookies();
  const guestSessionKey = cookieStore.get('guestSessionKey')?.value;
  const accessToken = cookieStore.get('accessToken')?.value;
  const loggedInUserId = accessToken ? await verifyAccessToken(accessToken) : null;

  const session = await findExplorationSessionById(sessionId);
  if (!session) {
    return fail('SESSION_NOT_FOUND', '탐색 세션을 찾을 수 없습니다.', 404);
  }

  const isGuestOwner = session.sessionKey === guestSessionKey;
  const isLoggedInOwner = loggedInUserId != null && session.userId === loggedInUserId;
  if (!isGuestOwner && !isLoggedInOwner) {
    return fail('SESSION_NOT_FOUND', '탐색 세션을 찾을 수 없습니다.', 404);
  }

  if (session.expiresAt != null && session.expiresAt < new Date()) {
    return fail('SESSION_EXPIRED', '탐색 세션이 만료되었습니다.', 410);
  }

  if (session.status === 'RECOMMENDATION_COMPLETED') {
    return fail('ALREADY_COMPLETED', '이미 추천이 완료된 세션입니다.', 409);
  }

  try {
    const [weatherResult, dustResult] = await Promise.allSettled([
      session.nx != null && session.ny != null
        ? getWeather(session.nx, session.ny)
        : Promise.resolve(null),
      session.stationName
        ? getDust(session.stationName)
        : Promise.resolve(null),
    ]);

    const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;
    const dust = dustResult.status === 'fulfilled' ? dustResult.value : null;

    const indoorForced = checkIndoorForced(weather, dust);

    const candidates = await findRecommendationCandidates();

    const answersMap = Object.fromEntries(
      answers.map((a) => [a.questionKey, a.answerValue]),
    ) as Record<'q1' | 'q2' | 'q3' | 'q4', string>;
    const scored = scoreAndRankEvents(candidates, answersMap, session.lat, session.lng, indoorForced);
    const { items, nearbyExpanded } = filterAndSort(scored);

    const curation = buildCurationMessage(weather, answersMap['q2'], answersMap['q4']);

    const userId = session.userId ?? null;

    const runId = await saveRecommendation({
      sessionId,
      userId,
      sido: session.sido ?? null,
      nx: session.nx ?? null,
      ny: session.ny ?? null,
      answers: answers.map((a) => ({ questionKey: a.questionKey, answerValue: a.answerValue })),
      weather,
      dust,
      curation,
      indoorForced,
      nearbyExpanded,
      items,
    });

    const favoritedIds = await findFavoritedEventIds(loggedInUserId, items.map((i) => i.id));

    return ok({
      runId,
      curation,
      indoorForced,
      nearbyExpanded,
      totalCount: items.length,
      weather: weather
        ? { skyLabel: weather.skyLabel, temperature: weather.temperature, pty: weather.pty }
        : null,
      dust: dust
        ? {
            pm10Value: dust.pm10Value,
            pm10Grade: dust.pm10Grade,
            pm25Value: dust.pm25Value,
            pm25Grade: dust.pm25Grade,
          }
        : null,
      items: items.map((item, i) => ({
        rank: i + 1,
        score: item.score,
        distanceKm: item.distanceKm != null ? Math.round(item.distanceKm * 100) / 100 : null,
        isFavorited: favoritedIds.has(item.id),
        eventItem: {
          id: item.id,
          title: item.title,
          realmName: item.realmName,
          place: item.place,
          address: item.address,
          lat: item.lat,
          lng: item.lng,
          startDate: item.startDate ? item.startDate.toISOString().slice(0, 10) : null,
          endDate: item.endDate ? item.endDate.toISOString().slice(0, 10) : null,
          price: item.price,
          description: item.description,
          imageUrl: item.imageUrl,
          bookingUrl: item.bookingUrl,
        },
      })),
    });
  } catch (err) {
    console.error('추천 처리 실패', err);
    return fail('INTERNAL_ERROR', '서버 오류가 발생했습니다.', 500);
  }
}
