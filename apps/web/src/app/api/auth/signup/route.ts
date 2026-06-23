import { created, fail } from '@/lib/api-response';
import { signupSchema, SIGNUP_ERRORS } from '@/features/auth/schemas/signupSchema';
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
    const issues = parsed.error.issues;
    const passwordMismatch = issues.find(
      (i) => i.path.includes('passwordConfirm') && i.message === SIGNUP_ERRORS.PASSWORD_MISMATCH,
    );
    const privacyRequired = issues.find((i) => i.path.includes('privacyAgreed'));

    if (passwordMismatch) {
      return fail('PASSWORD_MISMATCH', '비밀번호가 일치하지 않습니다', 400);
    }
    if (privacyRequired) {
      return fail('PRIVACY_AGREEMENT_REQUIRED', '개인정보 수집에 동의해주세요', 400);
    }
    return fail('INVALID_INPUT', issues[0]?.message ?? '입력값을 확인해주세요', 400);
  }

  const { email, password, nickname } = parsed.data;
  const resolvedNickname = nickname?.trim() || email.split('@')[0];

  try {
    const user = await signup(email, password, resolvedNickname);
    return created({ userId: user.id, email: user.email, nickname: user.nickname });
  } catch (error) {
    const isEmailConflict =
      (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') ||
      (error as { code?: string })?.code === 'P2002';

    if (isEmailConflict) {
      return fail('EMAIL_ALREADY_EXISTS', '이미 사용 중인 이메일입니다', 409);
    }
    console.error('[signup]', error);
    return fail('SIGNUP_FAILED', '서버 오류가 발생했습니다', 500);
  }
}
