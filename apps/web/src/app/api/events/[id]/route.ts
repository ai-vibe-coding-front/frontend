import { ok, fail } from '@/lib/api-response';
import { XMLParser } from 'fast-xml-parser';

const CULTURE_API_BASE_URL = 'https://apis.data.go.kr/B553457/cultureinfo';

type RawCultureEventDetail = {
  seq: number;
  title: string;
  realmName?: string;
  place?: string;
  placeAddr?: string;
  startDate?: number;
  endDate?: number;
  gpsX?: number;
  gpsY?: number;
  imgUrl?: string;
  price?: string;
  contents1?: string;
  url?: string;
};

type ParsedCultureDetailResponse = {
  response?: {
    header?: { resultCode?: number; resultMsg?: string };
    body?: {
      items?: { item?: RawCultureEventDetail | RawCultureEventDetail[] };
    };
  };
};

function formatDate(value?: number): string | null {
  if (!value) return null;
  const str = String(value);
  return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
}

// 공공데이터포털 응답이 HTML 엔티티를 이중으로 인코딩해서 내려주는 경우가 있어
// XML 파싱으로 한 번 풀린 뒤에도 "&lt;"같은 표기가 그대로 남는다. 한 번 더 풀어준다.
function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const serviceKey = process.env.CULTURE_API_KEY;
  if (!serviceKey) {
    return fail('SERVICE_KEY_MISSING', 'CULTURE_API_KEY가 설정되지 않았습니다.', 500);
  }

  // serviceKey는 포털에서 이미 URL-encoding된 값이므로 다시 인코딩하지 않고 그대로 붙인다.
  const requestUrl = `${CULTURE_API_BASE_URL}/detail2?serviceKey=${serviceKey}&seq=${encodeURIComponent(id)}`;

  try {
    const response = await fetch(requestUrl, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      return fail('EVENT_FETCH_FAILED', '문화정보 API 응답 오류', 502);
    }

    const xmlText = await response.text();
    const parsed = new XMLParser().parse(xmlText) as ParsedCultureDetailResponse;

    if (parsed.response?.header?.resultCode !== 0) {
      return fail('EVENT_NOT_FOUND', '존재하지 않는 행사입니다', 404);
    }

    const rawItem = parsed.response?.body?.items?.item;
    const raw = Array.isArray(rawItem) ? rawItem[0] : rawItem;
    if (!raw) {
      return fail('EVENT_NOT_FOUND', '존재하지 않는 행사입니다', 404);
    }

    return ok({
      id: String(raw.seq),
      title: decodeHtmlEntities(raw.title),
      realmCode: null,
      realmName: raw.realmName ?? null,
      startDate: formatDate(raw.startDate),
      endDate: formatDate(raw.endDate),
      place: raw.place ? decodeHtmlEntities(raw.place) : raw.placeAddr ? decodeHtmlEntities(raw.placeAddr) : null,
      price: raw.price ?? null,
      description: raw.contents1 ? decodeHtmlEntities(raw.contents1) : '',
      imageUrl: raw.imgUrl ?? null,
      bookingUrl: raw.url ?? null,
      lat: raw.gpsY ?? null,
      lng: raw.gpsX ?? null,
    });
  } catch (err) {
    console.error('문화정보 상세 API 호출 실패', err);
    return fail('EVENT_FETCH_FAILED', '문화정보 API에 연결할 수 없습니다.', 504);
  }
}
