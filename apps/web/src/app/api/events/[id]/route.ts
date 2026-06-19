import { ok, fail } from '@/lib/api-response';

const MOCK_EVENT = {
  id: '315929',
  title: '《생이 깃든 소나무》',
  category: '전시',
  period: '2025.02.26 — 2026.06.30',
  venue: '성북구립미술관',
  fee: '무료',
  description: '서울특별시 성북구 성북로 134 성북구립미술관 | 02-6925-5011',
  imageUrl: null,
  externalUrl: 'https://sma.sbculture.or.kr/sma/exhibition/current.do?mode=view&articleNo=43458&article.offset=0&articleLimit=10',
  latitude: 37.59482890788785,
  longitude: 126.99488186959195,
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (id !== MOCK_EVENT.id) {
    return fail('EVENT_NOT_FOUND', '존재하지 않는 행사입니다', 404);
  }

  return ok(MOCK_EVENT);
}
