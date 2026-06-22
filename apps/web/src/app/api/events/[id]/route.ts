import { ok, fail } from '@/lib/api-response';
import { getEventDetail } from '@/server/services/event-service';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return fail('EVENT_NOT_FOUND', '존재하지 않는 행사입니다', 404);
  }

  try {
    const event = await getEventDetail(id);
    if (!event) {
      return fail('EVENT_NOT_FOUND', '존재하지 않는 행사입니다', 404);
    }

    return ok(event);
  } catch (err) {
    console.error('[GET /api/events/:id]', err);
    return fail('INTERNAL_ERROR', '행사 정보를 불러올 수 없습니다', 500);
  }
}
