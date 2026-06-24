import { cookies } from 'next/headers';
import { fail, ok } from '@/lib/api-response';
import { verifyAccessToken } from '@/server/services/auth-service';
import { findUserWithFavoriteCount } from '@/server/repositories/user-repository';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const userId = accessToken ? await verifyAccessToken(accessToken) : null;

  if (!userId) {
    return fail('UNAUTHORIZED', '로그인이 필요합니다.', 401);
  }

  try {
    const user = await findUserWithFavoriteCount(userId);

    if (!user) {
      return fail('USER_NOT_FOUND', '사용자 정보를 찾을 수 없습니다.', 404);
    }

    return ok({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      favoriteCount: user._count.favorites,
    });
  } catch (error) {
    console.error('[users/me]', error);
    return fail(
      'USER_FETCH_FAILED',
      '사용자 정보를 불러오지 못했습니다.',
      500,
    );
  }
}
