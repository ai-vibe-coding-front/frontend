import { cookies } from 'next/headers';
import { fail, ok } from '@/lib/api-response';
import { RECENT_RECOMMENDATIONS_LIMIT } from '@/features/recommendations/constants';
import { verifyAccessToken } from '@/server/services/auth-service';
import { getRecentRecommendations } from '@/server/services/recommendation-service';

const MIN_RECENT_RECOMMENDATIONS_LIMIT = 1;
const MAX_RECENT_RECOMMENDATIONS_LIMIT = 20;

function parseRecentRecommendationsLimit(limitParam: string | null) {
  if (!limitParam) {
    return RECENT_RECOMMENDATIONS_LIMIT;
  }

  const limit = Number(limitParam);

  if (
    !Number.isInteger(limit) ||
    limit < MIN_RECENT_RECOMMENDATIONS_LIMIT ||
    limit > MAX_RECENT_RECOMMENDATIONS_LIMIT
  ) {
    return null;
  }

  return limit;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseRecentRecommendationsLimit(searchParams.get('limit'));

  if (limit === null) {
    return fail('INVALID_RECENT_RECOMMENDATIONS_LIMIT', '최근 추천 결과 개수가 올바르지 않습니다.', 400);
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const userId = accessToken ? await verifyAccessToken(accessToken) : null;

  if (!userId) {
    return fail('UNAUTHORIZED', '로그인이 필요합니다.', 401);
  }

  try {
    const result = await getRecentRecommendations({
      userId,
      limit,
    });

    return ok(result);
  } catch (error) {
    console.error('[GET /api/recommendations/recent]', error);
    return fail('RECENT_RECOMMENDATIONS_FETCH_FAILED', '최근 추천 결과를 불러오지 못했습니다.', 500);
  }
}
