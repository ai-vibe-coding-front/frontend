import { cookies } from 'next/headers';
import { ok, created, fail } from '@/lib/api-response';
import { verifyAccessToken } from '@/server/services/auth-service';
import { addFavorite, removeFavorite } from '@/server/services/event-service';

async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  return accessToken ? await verifyAccessToken(accessToken) : null;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return fail('UNAUTHORIZED', '로그인이 필요합니다.', 401);
  }

  const { id } = await params;

  try {
    const result = await addFavorite(userId, id);
    if (!result.ok) {
      return fail('EVENT_NOT_FOUND', '존재하지 않는 행사입니다.', 404);
    }

    return created({ isFavorited: true });
  } catch (err) {
    console.error('관심 행사 등록 실패', err);
    return fail('FAVORITE_CREATE_FAILED', '관심 행사 등록에 실패했습니다.', 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return fail('UNAUTHORIZED', '로그인이 필요합니다.', 401);
  }

  const { id } = await params;

  try {
    await removeFavorite(userId, id);
    return ok({ isFavorited: false });
  } catch (err) {
    console.error('관심 행사 삭제 실패', err);
    return fail('FAVORITE_DELETE_FAILED', '관심 행사 삭제에 실패했습니다.', 500);
  }
}
