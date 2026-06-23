import { ok, fail } from '@/lib/api-response';
import { getEventDetail } from '@/server/services/event-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const event = await getEventDetail(id);
    if (!event) {
      return fail('EVENT_NOT_FOUND', '존재하지 않는 행사입니다', 404);
    }

    return ok(event);
  } catch (err) {
    console.error('행사 상세 조회 실패', err);
    return fail('EVENT_FETCH_FAILED', '행사 상세 조회에 실패했습니다.', 500);
  }
}
