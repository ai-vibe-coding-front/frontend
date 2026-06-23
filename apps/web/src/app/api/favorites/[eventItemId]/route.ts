import { cookies } from "next/headers";
import { ok, fail } from "@/lib/api-response";
import { verifyAccessToken } from "@/server/services/auth-service";
import {
  countFavorites,
  deleteFavorite,
  findFavoriteByUserAndEvent,
} from "@/server/repositories/event-repository";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ eventItemId: string }> },
) {
  const { eventItemId } = await params;

  if (!UUID_REGEX.test(eventItemId)) {
    return fail("INVALID_EVENT_ID", "행사 ID가 올바르지 않습니다.", 400);
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) {
    return fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  }
  const userId = await verifyAccessToken(accessToken);
  if (!userId) {
    return fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  }

  try {
    const existing = await findFavoriteByUserAndEvent(userId, eventItemId);
    if (!existing) {
      return fail("FAVORITE_NOT_FOUND", "저장된 행사가 아닙니다.", 404);
    }

    await deleteFavorite(userId, eventItemId);
    const favoriteCount = await countFavorites(userId);

    return ok({ eventItemId, isFavorited: false, favoriteCount });
  } catch (err) {
    console.error("[DELETE /api/favorites/:eventItemId]", err);
    return fail("FAVORITE_DELETE_FAILED", "찜 해제에 실패했습니다.", 500);
  }
}
