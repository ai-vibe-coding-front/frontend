import { cookies } from "next/headers";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { created, fail } from "@/lib/api-response";
import { verifyAccessToken } from "@/server/services/auth-service";
import {
  countFavorites,
  createFavorite,
  findEventDetailById,
  findFavoriteByUserAndEvent,
} from "@/server/repositories/event-repository";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const schema = z.object({
  eventItemId: z.string(),
  explorationSessionId: z.string().optional(),
  recommendationRunId: z.string().optional(),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) {
    return fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  }
  const userId = await verifyAccessToken(accessToken);
  if (!userId) {
    return fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("INVALID_INPUT", "요청 형식이 올바르지 않습니다.", 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail("INVALID_INPUT", parsed.error.issues[0]?.message ?? "입력값을 확인해주세요.", 400);
  }

  const { eventItemId } = parsed.data;

  if (!UUID_REGEX.test(eventItemId)) {
    return fail("INVALID_EVENT_ID", "행사 ID가 올바르지 않습니다.", 400);
  }

  try {
    const event = await findEventDetailById(eventItemId);
    if (!event) {
      return fail("EVENT_NOT_FOUND", "행사를 찾을 수 없습니다.", 404);
    }

    const existing = await findFavoriteByUserAndEvent(userId, eventItemId);
    if (existing) {
      return fail("FAVORITE_ALREADY_EXISTS", "이미 저장한 관심행사입니다.", 409);
    }

    await createFavorite(userId, eventItemId);
    const favoriteCount = await countFavorites(userId);

    return created({ eventItemId, isFavorited: true, favoriteCount });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return fail("FAVORITE_ALREADY_EXISTS", "이미 저장한 관심행사입니다.", 409);
    }
    console.error("[POST /api/favorites]", err);
    return fail("FAVORITE_CREATE_FAILED", "관심행사 저장에 실패했습니다.", 500);
  }
}
