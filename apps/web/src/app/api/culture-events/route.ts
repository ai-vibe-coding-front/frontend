import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

const CULTURE_API_BASE_URL = "https://apis.data.go.kr/B553457/cultureinfo";

type RawCultureEventItem = {
  seq: number;
  title: string;
  realmName?: string;
  place?: string;
  startDate?: number;
  endDate?: number;
  gpsX?: number;
  gpsY?: number;
  thumbnail?: string;
  area?: string;
  sigungu?: string;
};

type ParsedCultureResponse = {
  response?: {
    header?: { resultCode?: number; resultMsg?: string };
    body?: {
      totalCount?: number;
      items?: { item?: RawCultureEventItem | RawCultureEventItem[] };
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
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function mapCultureEvent(raw: RawCultureEventItem) {
  return {
    externalId: String(raw.seq),
    title: decodeHtmlEntities(raw.title),
    realmName: raw.realmName ?? null,
    place: raw.place ? decodeHtmlEntities(raw.place) : null,
    startDate: formatDate(raw.startDate),
    endDate: formatDate(raw.endDate),
    lat: raw.gpsY ?? null,
    lng: raw.gpsX ?? null,
    imageUrl: raw.thumbnail ?? null,
    area: raw.area ?? null,
    sigungu: raw.sigungu ?? null,
  };
}

export async function GET(request: Request) {
  const serviceKey = process.env.CULTURE_API_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: "CULTURE_API_KEY가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);

  const otherParams = new URLSearchParams({
    PageNo: searchParams.get("pageNo") ?? "1",
    numOfrows: searchParams.get("numOfRows") ?? "10",
    gpsxfrom: searchParams.get("gpsxfrom") ?? "",
    gpsyfrom: searchParams.get("gpsyfrom") ?? "",
    gpsxto: searchParams.get("gpsxto") ?? "",
    gpsyto: searchParams.get("gpsyto") ?? "",
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
  });

  // serviceKey는 포털에서 이미 URL-encoding된 값이므로 다시 인코딩하지 않고 그대로 붙인다.
  const requestUrl = `${CULTURE_API_BASE_URL}/period2?serviceKey=${serviceKey}&${otherParams.toString()}`;

  try {
    const response = await fetch(requestUrl, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      return NextResponse.json(
        { error: "문화정보 API 응답 오류", events: [], totalCount: 0 },
        { status: 502 },
      );
    }

    const xmlText = await response.text();
    const parser = new XMLParser();
    const parsed = parser.parse(xmlText) as ParsedCultureResponse;

    const resultCode = parsed.response?.header?.resultCode;
    if (resultCode !== 0) {
      return NextResponse.json(
        { error: parsed.response?.header?.resultMsg ?? "문화정보 API 오류", events: [], totalCount: 0 },
        { status: 502 },
      );
    }

    const rawItem = parsed.response?.body?.items?.item;
    const rawItems = Array.isArray(rawItem) ? rawItem : rawItem ? [rawItem] : [];

    return NextResponse.json({
      totalCount: parsed.response?.body?.totalCount ?? 0,
      events: rawItems.map(mapCultureEvent),
    });
  } catch (err) {
    console.error("문화정보 API 호출 실패", err);
    return NextResponse.json(
      { error: "문화정보 API에 연결할 수 없습니다.", events: [], totalCount: 0 },
      { status: 504 },
    );
  }
}
