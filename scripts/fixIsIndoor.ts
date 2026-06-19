import dotenv from 'dotenv';
dotenv.config({ path: 'apps/web/.env' });

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const OUTDOOR_KEYWORDS = ['공원', '광장', '야외', '해변', '해수욕장', '잔디', '노천'];
const INDOOR_KEYWORDS = ['미술관', '갤러리', '홀', '센터', '극장', '박물관', '아트홀', '문화원', '도서관'];

function judgeIsIndoor(placeName: string): boolean | null {
  const hasOutdoor = OUTDOOR_KEYWORDS.some((k) => placeName.includes(k));
  const hasIndoor = INDOOR_KEYWORDS.some((k) => placeName.includes(k));

  if (hasOutdoor && hasIndoor) return null; // 충돌 → 건드리지 않음
  if (hasIndoor) return true;
  if (hasOutdoor) return false;
  return null; // 판단 불가 → 건드리지 않음
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL 환경변수가 없습니다.');

  console.log('fixIsIndoor 시작...');

  const items = await prisma.eventItem.findMany({
    where: { deletedAt: null, place: { not: null } },
    select: { id: true, place: true, isIndoor: true },
  });

  console.log(`전체 대상: ${items.length}건`);

  let fixed = 0;
  let skipped = 0;

  for (const item of items) {
    const judgment = judgeIsIndoor(item.place!);

    if (judgment === null) {
      skipped++;
      continue;
    }

    if (item.isIndoor === judgment) {
      skipped++;
      continue;
    }

    await prisma.eventItem.update({
      where: { id: item.id },
      data: { isIndoor: judgment },
    });

    fixed++;
  }

  console.log(`완료 — 보정: ${fixed}건, 건너뜀(판단불가·일치): ${skipped}건`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
