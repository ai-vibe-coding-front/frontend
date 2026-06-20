import { prisma } from './scriptClient';

async function main() {
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
