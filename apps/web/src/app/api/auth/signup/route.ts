import { created, fail } from '@/lib/api-response';
import { signupSchema } from '@/features/auth/schemas/signupSchema';
import { signup } from '@/server/services/auth-service';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('INVALID_INPUT', '요청 형식이 올바르지 않습니다', 400);
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return fail('INVALID_INPUT', parsed.error.issues[0]?.message ?? '입력값을 확인해주세요', 400);
  }

  const { email, password, nickname } = parsed.data;
  const resolvedNickname = nickname?.trim() || email.split('@')[0];

  try {
    const user = await signup(email, password, resolvedNickname);
    return created({ user });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
      return fail('EMAIL_ALREADY_EXISTS', '이미 사용 중인 이메일입니다', 409);
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return fail('EMAIL_ALREADY_EXISTS', '이미 사용 중인 이메일입니다', 409);
    }
    return fail('INTERNAL_ERROR', '서버 오류가 발생했습니다', 500);
  }
}
