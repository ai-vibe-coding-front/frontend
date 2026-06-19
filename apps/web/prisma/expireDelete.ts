import dotenv from 'dotenv';
dotenv.config({ path: 'apps/web/.env' });

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL 환경변수가 없습니다.');

  console.log('만료 행사 soft delete 시작...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await prisma.eventItem.updateMany({
    where: {
      endDate: { lt: today },
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  console.log(`완료 — soft delete 처리: ${result.count}건`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
