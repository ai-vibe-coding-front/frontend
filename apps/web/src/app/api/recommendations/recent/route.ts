import { cookies } from 'next/headers';
import { fail, ok } from '@/lib/api-response';
import { verifyAccessToken } from '@/server/services/auth-service';
import { getRecentRecommendations } from '@/server/services/recommendation-service';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const userId = accessToken ? await verifyAccessToken(accessToken) : null;

  if (!userId) {
    return fail('UNAUTHORIZED', '로그인이 필요합니다.', 401);
  }

  try {
    const result = await getRecentRecommendations({
      userId,
      limit: 7,
    });

    return ok(result);
  } catch (error) {
    console.error('[GET /api/recommendations/recent]', error);
    return fail('RECENT_RECOMMENDATIONS_FETCH_FAILED', '최근 추천 결과를 불러오지 못했습니다.', 500);
  }
}
