export interface DustResult {
  pm10Grade: string | null;
  pm25Grade: string | null;
  pm10Value: number | null;
  pm25Value: number | null;
}

interface AirQualityItem {
  pm10Grade: string;
  pm25Grade: string;
  pm10Value: string;
  pm25Value: string;
}

interface AirQualityResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: AirQualityItem[];
      totalCount: number;
    };
  };
}

function parseValue(raw: string): number | null {
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
}

const GRADE_LABEL_MAP: Record<string, string> = {
  좋음: '1',
  보통: '2',
  나쁨: '3',
  매우나쁨: '4',
};

function parseGrade(raw: string): string | null {
  if (!raw || raw === '-') return null;
  return GRADE_LABEL_MAP[raw] ?? raw;
}

export async function getDust(stationName: string): Promise<DustResult> {
  const apiKey = process.env.DUST_API_KEY;
  if (!apiKey) throw new Error('DUST_API_KEY not set');

  const params = new URLSearchParams({
    serviceKey: apiKey,
    returnType: 'json',
    numOfRows: '1',
    pageNo: '1',
    stationName,
    dataTerm: 'DAILY',
    ver: '1.0',
  });

  const url =
    `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?${params}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`AirKorea API error: ${res.status}`);

  const json = (await res.json()) as AirQualityResponse;
  const items = json.response?.body?.items;

  if (!items || items.length === 0) {
    return { pm10Grade: null, pm25Grade: null, pm10Value: null, pm25Value: null };
  }

  const item = items[0];
  return {
    pm10Grade: parseGrade(item.pm10Grade),
    pm25Grade: parseGrade(item.pm25Grade),
    pm10Value: parseValue(item.pm10Value),
    pm25Value: parseValue(item.pm25Value),
  };
}
