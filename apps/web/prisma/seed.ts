import { prisma } from './scriptClient';

const API_KEY = process.env.CULTURE_API_KEY;
const ROWS_PER_PAGE = 100;
const BASE_URL = 'https://apis.data.go.kr/B553457/cultureinfo';
const SOURCE = '공공데이터포털';

function getTagValue(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)<\/${tag}>`));
  return match ? match[1].trim() : '';
}

function getAllItems(xml: string): string[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.length !== 8) return null;
  const year = parseInt(dateStr.slice(0, 4), 10);
  const month = parseInt(dateStr.slice(4, 6), 10) - 1;
  const day = parseInt(dateStr.slice(6, 8), 10);
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

async function fetchSeqList(page: number): Promise<{ seqs: string[]; totalCount: number }> {
  const url = `${BASE_URL}/period2?serviceKey=${encodeURIComponent(API_KEY!)}&PageNo=${page}&numOfrows=${ROWS_PER_PAGE}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`period2 API 오류: ${res.status}`);

  const xml = await res.text();
  const totalCount = parseInt(getTagValue(xml, 'totalCount'), 10) || 0;
  const items = getAllItems(xml);
  const seqs = items.map((item) => getTagValue(item, 'seq')).filter(Boolean);

  return { seqs, totalCount };
}

async function fetchDetail(seq: string): Promise<Record<string, string> | null> {
  const url = `${BASE_URL}/detail2?serviceKey=${encodeURIComponent(API_KEY!)}&seq=${seq}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const xml = await res.text();
  const items = getAllItems(xml);
  if (items.length === 0) return null;

  const item = items[0];
  return {
    seq: getTagValue(item, 'seq'),
    title: getTagValue(item, 'title'),
    realmName: getTagValue(item, 'realmName'),
    place: getTagValue(item, 'place'),
    placeAddr: getTagValue(item, 'placeAddr'),
    gpsX: getTagValue(item, 'gpsX'),
    gpsY: getTagValue(item, 'gpsY'),
    startDate: getTagValue(item, 'startDate'),
    endDate: getTagValue(item, 'endDate'),
    price: getTagValue(item, 'price'),
    imgUrl: getTagValue(item, 'imgUrl'),
    url: getTagValue(item, 'url'),
  };
}

async function upsertItem(detail: Record<string, string>): Promise<'created' | 'updated' | 'skipped'> {
  if (!detail.title) return 'skipped';

  const data = {
    externalId: detail.seq || null,
    title: detail.title,
    realmName: detail.realmName || null,
    realmCode: null,
    place: detail.place || null,
    address: detail.placeAddr || null,
    lng: detail.gpsX ? parseFloat(detail.gpsX) : null,
    lat: detail.gpsY ? parseFloat(detail.gpsY) : null,
    startDate: parseDate(detail.startDate),
    endDate: parseDate(detail.endDate),
    price: detail.price || null,
    imageUrl: detail.imgUrl || null,
    bookingUrl: detail.url || null,
    source: SOURCE,
  };

  if (!data.externalId) {
    await prisma.eventItem.create({ data });
    return 'created';
  }

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
      deletedAt: null,
    },
  });

  return existing ? 'updated' : 'created';
}

async function main() {
  if (!API_KEY) throw new Error('CULTURE_API_KEY 환경변수가 없습니다.');

  console.log('seed 시작...');

  const { seqs: firstSeqs, totalCount } = await fetchSeqList(1);
  const totalPages = Math.ceil(totalCount / ROWS_PER_PAGE);
  console.log(`전체 ${totalCount}건, ${totalPages}페이지`);

  const allSeqs: string[] = [...firstSeqs];

  for (let page = 2; page <= totalPages; page++) {
    console.log(`  period2 페이지 ${page}/${totalPages} 수집 중...`);
    const { seqs } = await fetchSeqList(page);
    allSeqs.push(...seqs);
  }

  console.log(`seq 수집 완료: ${allSeqs.length}건 → detail2 호출 시작`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < allSeqs.length; i++) {
    const seq = allSeqs[i];
    process.stdout.write(`  [${i + 1}/${allSeqs.length}] seq:${seq} ... `);

    const detail = await fetchDetail(seq);
    if (!detail) {
      console.log('skip (detail2 오류)');
      skipped++;
      continue;
    }

    const result = await upsertItem(detail);
    console.log(result);
    if (result === 'created') created++;
    else if (result === 'updated') updated++;
    else skipped++;
  }

  console.log(`\n완료 — 신규: ${created}, 수정: ${updated}, 건너뜀: ${skipped}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
