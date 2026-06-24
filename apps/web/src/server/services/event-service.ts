import {
  findEventDetailById,
  findFavoritedEventIds,
  findNearbyEventCandidates,
} from '@/server/repositories/event-repository';

const EARTH_RADIUS_KM = 6371;
const KM_PER_DEGREE_LAT = 111;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

function boundingBoxFromRadius(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / KM_PER_DEGREE_LAT;
  const lngDelta = radiusKm / (KM_PER_DEGREE_LAT * Math.cos(toRadians(lat)));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

function formatDate(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

// 공공데이터포털 동기화 데이터에 HTML 엔티티가 이중으로 인코딩되어 들어온 경우가 있어
// "&lt;"같은 표기가 그대로 남는다. 한 번 더 풀어준다.
function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

type NearbyEventsParams = {
  lat: number;
  lng: number;
  radiusKm: number;
  limit: number;
  category?: string;
  userId?: string | null;
};

export type NearbyEventItem = {
  eventItemId: string;
  title: string;
  realmName: string | null;
  place: string | null;
  address: string | null;
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  lat: number;
  lng: number;
  distanceKm: number;
  isFavorited: boolean;
};

export async function findNearbyEvents(params: NearbyEventsParams): Promise<{
  items: NearbyEventItem[];
  total: number;
  radiusKm: number;
}> {
  const bbox = boundingBoxFromRadius(params.lat, params.lng, params.radiusKm);
  const candidates = await findNearbyEventCandidates(bbox, params.category);

  const withDistance = candidates
    .filter((event) => event.lat != null && event.lng != null)
    .map((event) => ({
      event,
      distanceKm: calculateDistanceKm(params.lat, params.lng, event.lat as number, event.lng as number),
    }))
    .filter(({ distanceKm }) => distanceKm <= params.radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, params.limit);

  const favoritedIds = params.userId
    ? await findFavoritedEventIds(params.userId, withDistance.map(({ event }) => event.id))
    : new Set<string>();

  const items: NearbyEventItem[] = withDistance.map(({ event, distanceKm }) => ({
    eventItemId: event.id,
    title: decodeHtmlEntities(event.title),
    realmName: event.realmName,
    place: event.place ? decodeHtmlEntities(event.place) : null,
    address: event.address ? decodeHtmlEntities(event.address) : null,
    startDate: formatDate(event.startDate),
    endDate: formatDate(event.endDate),
    imageUrl: event.imageUrl,
    lat: event.lat as number,
    lng: event.lng as number,
    distanceKm: Math.round(distanceKm * 100) / 100,
    isFavorited: favoritedIds.has(event.id),
  }));

  return {
    items,
    total: items.length,
    radiusKm: params.radiusKm,
  };
}

export type EventDetail = {
  eventItemId: string;
  title: string;
  realmName: string | null;
  startDate: string | null;
  endDate: string | null;
  place: string | null;
  address: string | null;
  price: string | null;
  description: string;
  imageUrl: string | null;
  bookingUrl: string | null;
  lat: number | null;
  lng: number | null;
  isIndoor: boolean | null;
  isFavorited: boolean;
};

export async function getEventDetail(id: string): Promise<EventDetail | null> {
  const event = await findEventDetailById(id);
  if (!event) return null;

  return {
    eventItemId: event.id,
    title: decodeHtmlEntities(event.title),
    realmName: event.realmName,
    startDate: formatDate(event.startDate),
    endDate: formatDate(event.endDate),
    place: event.place
      ? decodeHtmlEntities(event.place)
      : event.address
        ? decodeHtmlEntities(event.address)
        : null,
    address: event.address ? decodeHtmlEntities(event.address) : null,
    price: event.price,
    description: event.description ? decodeHtmlEntities(event.description) : '',
    imageUrl: event.imageUrl,
    bookingUrl: event.bookingUrl,
    lat: event.lat,
    lng: event.lng,
    isIndoor: event.isIndoor,
    isFavorited: false, // TODO: 찜하기 이슈에서 연결 예정
  };
}
