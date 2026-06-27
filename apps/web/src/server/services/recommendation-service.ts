import type { WeatherResult } from '@/lib/weatherApi';
import type { DustResult } from '@/lib/dustApi';
import {
  findFavoritedEventIds,
  findLatestRecommendationRunWithItems,
} from '@/server/repositories/recommendation-repository';
import type { EventCandidate, ScoredEvent } from '@/server/repositories/recommendation-repository';


const Q1_ENERGY: Record<string, string> = {
  high: '고에너지',
  medium: '중간에너지',
  low: '저에너지',
};

const Q2_MOOD: Record<string, string[]> = {
  warmth: ['힐링'],
  touched: ['감성적'],
  recharge: ['힐링', '차분한'],
  thrill: ['활기찬', '설레는'],
  stimulate: ['호기심'],
};

const Q3_REALM: Record<string, string[]> = {
  performance: ['뮤지컬', '연극', '무용'],
  music: ['음악', '콘서트', '국악'],
  exhibition: ['전시', '미술'],
  experience: ['교육', '체험'],
  festival: ['축제', '행사'],
  any: [],
};

const Q4_COMPANION: Record<string, string[]> = {
  alone: ['혼자'],
  special: ['연인', '친구'],
  group: ['친구'],
  family: ['가족', '어린이동반'],
};

function gradeToNum(grade: string | null | undefined): number {
  if (!grade) return 0;
  return parseInt(grade, 10) || 0;
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function calcDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function checkIndoorForced(
  weather: WeatherResult | null,
  dust: DustResult | null,
): boolean {
  return (
    (weather?.pty ?? 0) >= 1 ||
    gradeToNum(dust?.pm10Grade) >= 3 ||
    gradeToNum(dust?.pm25Grade) >= 3
  );
}

const INDOOR_BONUS = 3;

export function scoreAndRankEvents(
  candidates: EventCandidate[],
  answers: Record<string, string>,
  userLat: number | null,
  userLng: number | null,
  indoorForced: boolean = false,
): ScoredEvent[] {
  const energyTag = Q1_ENERGY[answers['q1']] ?? null;
  const moodTags = Q2_MOOD[answers['q2']] ?? [];
  const realmKeywords = Q3_REALM[answers['q3']] ?? [];
  const companionTags = Q4_COMPANION[answers['q4']] ?? [];

  const filtered =
    answers['q3'] !== 'any' && realmKeywords.length > 0
      ? candidates.filter((event) =>
          realmKeywords.some((kw) => event.realmName?.includes(kw)),
        )
      : candidates;

  return filtered.map((event) => {
    const eventTagNames = event.tags.map((et) => et.tag.name);
    let score = 0;
    const matchedTags: string[] = [];

    // 기분/감정(Q2): 서비스 핵심 축 — 3점
    for (const mood of moodTags) {
      if (eventTagNames.includes(mood)) {
        score += 3;
        matchedTags.push(mood);
      }
    }

    // 에너지(Q1): 감정의 강도를 보정하는 보조 축 — 2점
    if (energyTag && eventTagNames.includes(energyTag)) {
      score += 2;
      matchedTags.push(energyTag);
    }

    // 동반자(Q4): 상황 컨텍스트 — 1점
    for (const companion of companionTags) {
      if (eventTagNames.includes(companion)) {
        score += 1;
        matchedTags.push(companion);
      }
    }

    // 실내 보너스: 악천후/미세먼지 조건 시 실내 행사 우선
    if (indoorForced && event.isIndoor === true) {
      score += INDOOR_BONUS;
    }

    const distanceKm =
      userLat != null && userLng != null && event.lat != null && event.lng != null
        ? calcDistanceKm(userLat, userLng, event.lat, event.lng)
        : null;

    return {
      id: event.id,
      title: event.title,
      realmName: event.realmName,
      place: event.place,
      address: event.address,
      lat: event.lat,
      lng: event.lng,
      startDate: event.startDate,
      endDate: event.endDate,
      price: event.price,
      description: event.description,
      imageUrl: event.imageUrl,
      bookingUrl: event.bookingUrl,
      isIndoor: event.isIndoor,
      score,
      distanceKm,
      matchedTags,
    };
  });
}

const NEARBY_KM = 10;
const MAX_RESULTS = 7;

const HTML_ENTITY_MAP: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
  apos: "'",
  middot: '·',
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
};

function decodeHtmlEntitiesOnce(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-zA-Z]+|#39);/g, (match, entity: string) => HTML_ENTITY_MAP[entity] ?? match);
}

function decodeHtmlEntities(value: string): string {
  let decoded = value;

  for (let i = 0; i < 5; i += 1) {
    const next = decodeHtmlEntitiesOnce(decoded);
    if (next === decoded) break;
    decoded = next;
  }

  return decoded;
}

function sortScored(arr: ScoredEvent[]): ScoredEvent[] {
  return [...arr].sort(
    (a, b) =>
      b.score - a.score || (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
  );
}

export function filterAndSort(scored: ScoredEvent[]): {
  items: ScoredEvent[];
  nearbyExpanded: boolean;
} {
  const nearby = sortScored(
    scored.filter((e) => e.distanceKm !== null && e.distanceKm <= NEARBY_KM),
  );
  return { items: nearby.slice(0, MAX_RESULTS), nearbyExpanded: false };
}

const SKY_LABEL_MAP: Record<string, [string, string]> = {
  맑음: ['맑은', '☀️'],
  구름많음: ['구름 많은', '⛅'],
  흐림: ['흐린', '☁️'],
};

const PTY_LABEL_MAP: Record<number, [string, string]> = {
  1: ['비 오는', '🌧️'],
  2: ['비/눈 오는', '🌨️'],
  3: ['눈 오는', '❄️'],
  4: ['비 오는', '🌧️'],
  5: ['비 오는', '🌧️'],
  6: ['비/눈 오는', '🌨️'],
  7: ['눈 오는', '❄️'],
};

const Q2_MOOD_WORDS: Record<string, string> = {
  warmth: '따뜻한',
  touched: '감동적인',
  recharge: '힐링되는',
  thrill: '활기찬',
  stimulate: '호기심 가득한',
};

const Q4_COMPANION_WORDS: Record<string, string> = {
  alone: '혼자만의',
  special: '소중한 사람과 함께할',
  group: '친구들과 함께할',
  family: '가족과 함께할',
};

const DUST_LABEL_MAP: Array<{ minGrade: number; label: string; emoji: string }> = [
  { minGrade: 4, label: '미세먼지 매우 나쁜', emoji: '😷' },
  { minGrade: 3, label: '미세먼지 나쁜', emoji: '😷' },
];

function getDustEntry(dust: DustResult | null): [string, string] | null {
  if (!dust) return null;
  const max = Math.max(
    parseInt(dust.pm10Grade ?? '0', 10) || 0,
    parseInt(dust.pm25Grade ?? '0', 10) || 0,
  );
  const entry = DUST_LABEL_MAP.find((d) => max >= d.minGrade);
  return entry ? [entry.label, entry.emoji] : null;
}

export function buildCurationMessage(
  weather: WeatherResult | null,
  dust: DustResult | null,
  q2Answer: string,
  q4Answer: string,
): string {
  const moodWord = Q2_MOOD_WORDS[q2Answer] ?? '즐거운';
  const companionWord = Q4_COMPANION_WORDS[q4Answer] ?? '';

  const pty = weather?.pty ?? 0;
  const weatherEntry =
    pty > 0
      ? (PTY_LABEL_MAP[pty] ?? null)
      : (getDustEntry(dust) ?? (weather?.skyLabel ? (SKY_LABEL_MAP[weather.skyLabel] ?? null) : null));

  if (!weatherEntry) {
    return `${companionWord} ${moodWord} 행사를 추천해요 🎶`.trim();
  }

  const [weatherAdj, weatherEmoji] = weatherEntry;
  const isIndoorCondition = pty > 0 || getDustEntry(dust) !== null;
  const indoorWord = isIndoorCondition ? '실내 ' : '';
  return `${weatherAdj} 오늘, ${companionWord} ${moodWord} ${indoorWord}행사를 추천해요 ${weatherEmoji}`.trim();
}

export async function getRecentRecommendations(params: {
  userId: string;
  limit: number;
}) {
  const run = await findLatestRecommendationRunWithItems(params.userId, params.limit);

  if (!run) {
    return {
      runId: null,
      curation: null,
      items: [],
    };
  }

  const eventItemIds = run.items.map((item) => item.eventItem.id);
  const favoritedIds = await findFavoritedEventIds(params.userId, eventItemIds);

  return {
    runId: run.id,
    curation: run.curation,
    items: run.items.map((item) => ({
      recommendationRunId: run.id,
      rank: item.rank,
      eventItemId: item.eventItem.id,
      title: decodeHtmlEntities(item.eventItem.title),
      realmName: item.eventItem.realmName,
      place: item.eventItem.place ? decodeHtmlEntities(item.eventItem.place) : null,
      startDate: item.eventItem.startDate?.toISOString().slice(0, 10) ?? null,
      endDate: item.eventItem.endDate?.toISOString().slice(0, 10) ?? null,
      imageUrl: item.eventItem.imageUrl,
      isFavorited: favoritedIds.has(item.eventItem.id),
    })),
  };
}
