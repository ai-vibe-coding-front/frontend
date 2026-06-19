import { prisma } from '@/lib/prisma';

// MVP: deleted_at 필터 미적용 — 탈퇴 계정과 동일 이메일 재가입은 차단 (의도적 제한)
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUserWithCredential(
  email: string,
  nickname: string,
  passwordHash: string,
) {
  return prisma.user.create({
    data: {
      email,
      nickname,
      credential: {
        create: { passwordHash },
      },
    },
    select: { id: true, email: true, nickname: true },
  });
}
