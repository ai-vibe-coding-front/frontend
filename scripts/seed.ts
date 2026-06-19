import dotenv from 'dotenv';
dotenv.config({ path: 'apps/web/.env' });

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const API_KEY = process.env.PUBLIC_DATA_API_KEY;
const ROWS_PER_PAGE = 100;
const BASE_URL = 'http://www.culture.go.kr/openapi/rest/publicperformancedisplays/period';
const SOURCE = '서울문화포털';

interface ApiItem {
  seq?: string;
  title?: string;
  realmName?: string;
  realmCode?: string;
  place?: string;
  placeAddr?: string;
  gpsX?: string;
  gpsY?: string;
  startDate?: string;
  endDate?: string;
  price?: string;
  imgUrl?: string;
  url?: string;
}

interface ApiResponse {
  msgBody: {
    perforList: ApiItem | ApiItem[];
    totalCount: string | number;
  };
}

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const clean = String(dateStr).replace(/-/g, '').trim();
  if (clean.length !== 8) return null;
  const year = parseInt(clean.slice(0, 4), 10);
  const month = parseInt(clean.slice(4, 6), 10) - 1;
  const day = parseInt(clean.slice(6, 8), 10);
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

async function fetchPage(page: number): Promise<{ items: ApiItem[]; totalCount: number }> {
  const today = new Date();
  const from = today.toISOString().slice(0, 10).replace(/-/g, '');
  const oneYearLater = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  const to = oneYearLater.toISOString().slice(0, 10).replace(/-/g, '');

  const url = `${BASE_URL}?serviceKey=${API_KEY}&cPage=${page}&rows=${ROWS_PER_PAGE}&from=${from}&to=${to}&_type=json`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`API 호출 실패: ${res.status} ${url}`);

  const data = (await res.json()) as ApiResponse;
  const body = data.msgBody;

  const rawList = body.perforList;
  const items: ApiItem[] = Array.isArray(rawList) ? rawList : rawList ? [rawList] : [];
  const totalCount = Number(body.totalCount) || 0;

  return { items, totalCount };
}

async function upsertItem(item: ApiItem): Promise<'created' | 'updated' | 'skipped'> {
  if (!item.title) return 'skipped';

  const data = {
    title: item.title,
    externalId: item.seq ?? null,
    realmName: item.realmName ?? null,
    realmCode: item.realmCode ?? null,
    place: item.place ?? null,
    address: item.placeAddr ?? null,
    lng: item.gpsX ? parseFloat(item.gpsX) : null,
    lat: item.gpsY ? parseFloat(item.gpsY) : null,
    startDate: parseDate(item.startDate),
    endDate: parseDate(item.endDate),
    price: item.price ?? null,
    imageUrl: item.imgUrl ?? null,
    bookingUrl: item.url ?? null,
    source: SOURCE,
  };

  if (!data.externalId) {
    await prisma.eventItem.create({ data });
    return 'created';
  }

  // description, isIndoor는 AI 생성 필드이므로 update에서 제외
  const existing = await prisma.eventItem.findUnique({
    where: { externalId: data.externalId },
    select: { id: true },
  });

  await prisma.eventItem.upsert({
    where: { externalId: data.externalId },
    create: data,
    update: {
      title: data.title,
      realmName: data.realmName,
      realmCode: data.realmCode,
      place: data.place,
      address: data.address,
      lng: data.lng,
      lat: data.lat,
      startDate: data.startDate,
      endDate: data.endDate,
      price: data.price,
      imageUrl: data.imageUrl,
      bookingUrl: data.bookingUrl,
      source: data.source,
    },
  });

  return existing ? 'updated' : 'created';
}

async function main() {
  if (!API_KEY) throw new Error('PUBLIC_DATA_API_KEY 환경변수가 없습니다.');
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL 환경변수가 없습니다.');

  console.log('seed 시작...');

  const { items: firstItems, totalCount } = await fetchPage(1);
  const totalPages = Math.ceil(totalCount / ROWS_PER_PAGE);

  console.log(`전체 ${totalCount}건, ${totalPages}페이지`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  async function processItems(items: ApiItem[]) {
    for (const item of items) {
      const result = await upsertItem(item);
      if (result === 'created') created++;
      else if (result === 'updated') updated++;
      else skipped++;
    }
  }

  await processItems(firstItems);

  for (let page = 2; page <= totalPages; page++) {
    console.log(`  페이지 ${page}/${totalPages} 처리 중...`);
    const { items } = await fetchPage(page);
    await processItems(items);
  }

  console.log(`완료 — 신규: ${created}, 수정: ${updated}, 건너뜀(title 없음): ${skipped}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
