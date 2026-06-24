import { cookies } from "next/headers";
import { ok, fail } from "@/lib/api-response";
import { verifyAccessToken } from "@/server/services/auth-service";
import { getEventDetail } from "@/server/services/event-service";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return fail("INVALID_EVENT_ID", "행사 ID가 올바르지 않습니다.", 400);
  }

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const userId = accessToken ? await verifyAccessToken(accessToken) : null;

    const event = await getEventDetail(id, userId);
    if (!event) {
      return fail("EVENT_NOT_FOUND", "행사를 찾을 수 없습니다.", 404);
    }

    return ok(event);
  } catch (err) {
    console.error("[GET /api/events/:id]", err);
    return fail("EVENT_FETCH_FAILED", "행사 상세 조회에 실패했습니다.", 500);
  }
}
