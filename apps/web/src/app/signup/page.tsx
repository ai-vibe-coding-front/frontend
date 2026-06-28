'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Input } from '@/components/common/Input';
import { CTAButton } from '@/components/common/CTAButton';
import { Header } from '@/components/layout/Header';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { SIGNUP_ERRORS } from '@/features/auth/schemas/signupSchema';
import { ROUTES } from '@/constants/routes';
import { useSafeBack } from '@/hooks/useSafeBack';

type SignupFormData = {
  nickname: string;
  email: string;
  password: string;
  passwordConfirm: string;
  agreed: boolean;
};

const headingClass = 'font-bold text-[24px] text-[#1b1c19] tracking-[-1.2px] leading-[31.2px]';
const subtitleClass = 'font-medium text-[16px] text-[#6b6763] leading-[24px]';
const tableCellLabelClass = 'font-medium text-[12px] text-[rgba(107,103,99,0.7)] leading-[18px] w-[80px] shrink-0';
const tableCellValueClass = 'font-normal text-[12px] text-[#3f2a24] leading-[18px]';
const fieldErrorClass = 'text-[12px] text-red-500 leading-[18px] pl-1';

export default function SignupPage() {
  const router = useRouter();
  const handleBack = useSafeBack();
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setError,
    trigger,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<SignupFormData>({
    defaultValues: { nickname: '', email: '', password: '', passwordConfirm: '', agreed: false },
    mode: 'onTouched',
  });

  const agreed = useWatch({ control, name: 'agreed' });

  const passwordField = register('password', {
    required: '비밀번호를 입력해주세요',
    minLength: { value: 8, message: '비밀번호는 8자 이상이어야 합니다' },
    pattern: { value: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: '영문과 숫자를 조합해주세요' },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await apiClient<{ userId: string; email: string; nickname: string }>(
        '/api/auth/signup',
        {
          method: 'POST',
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            passwordConfirm: data.passwordConfirm,
            nickname: data.nickname,
            privacyAgreed: data.agreed,
          }),
        },
      );
      router.push(ROUTES.login);
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.errorCode === 'EMAIL_ALREADY_EXISTS') {
          setError('email', { message: '이미 사용 중인 이메일입니다' });
        } else if (error.errorCode === 'PASSWORD_MISMATCH') {
          setError('passwordConfirm', { message: SIGNUP_ERRORS.PASSWORD_MISMATCH });
        } else if (error.errorCode === 'PRIVACY_AGREEMENT_REQUIRED') {
          setError('root', { message: SIGNUP_ERRORS.PRIVACY_AGREEMENT_REQUIRED });
        } else {
          setError('root', { message: '오류가 발생했습니다. 다시 시도해주세요' });
        }
      } else {
        setError('root', { message: '오류가 발생했습니다. 다시 시도해주세요' });
      }
    }
  };

  return (
    <>
      <Header title="MUUD" onBackClick={handleBack} size="large" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-3">

        {/* 헤딩 */}
        <div className="flex flex-col gap-[11px] pb-6">
          <p className={headingClass}>반가워요! 정보를 입력해주세요</p>
          <p className={subtitleClass}>MUUD와 함께 따뜻한 문화 여정을 시작하세요</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Input
              placeholder="닉네임"
              {...register('nickname', {
                required: '닉네임을 입력해주세요',
                maxLength: { value: 20, message: '닉네임은 20자 이하로 입력해주세요' },
                validate: (v) => v.trim().length > 0 || '닉네임을 입력해주세요',
              })}
            />
            {errors.nickname && <p className={fieldErrorClass}>{errors.nickname.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <Input
              placeholder="이메일"
              type="email"
              {...register('email', {
                required: '이메일을 입력해주세요',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '올바른 이메일 주소를 입력해주세요' },
              })}
            />
            {errors.email && <p className={fieldErrorClass}>{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <Input
              placeholder="비밀번호"
              type="password"
              {...passwordField}
              onChange={(e) => { passwordField.onChange(e); if (touchedFields.passwordConfirm) trigger('passwordConfirm'); }}
            />
            {errors.password && <p className={fieldErrorClass}>{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <Input
              placeholder="비밀번호 확인"
              type="password"
              {...register('passwordConfirm', {
                required: '비밀번호 확인을 입력해주세요',
                validate: (value) => value === getValues('password') || '비밀번호가 일치하지 않습니다',
              })}
            />
            {errors.passwordConfirm && <p className={fieldErrorClass}>{errors.passwordConfirm.message}</p>}
          </div>

          {/* 개인정보 수집동의 */}
          <div className="flex flex-col gap-2 pt-1">
            <Controller
              name="agreed"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className="flex items-center gap-[10px]"
                >
                  <div className={`size-[18px] rounded-[5px] border shrink-0 flex items-center justify-center transition-colors ${field.value ? 'bg-[#8edfd2] border-[#8edfd2]' : 'bg-white border-[#e2e2e2]'}`}>
                    {field.value && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="#245b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[13px] text-[rgba(35,39,47,0.45)] leading-[19.5px]">
                    (필수) 개인정보 수집동의
                  </span>
                </button>
              )}
            />
            {/* 개인정보 테이블 */}
            <div className="bg-white border border-[#e2e2e2] rounded-[10px] overflow-hidden">
              <div className="flex items-center px-[14px] py-[9px] border-b border-[#e2e2e2]">
                <span className={tableCellLabelClass}>수집 항목</span>
                <span className={tableCellValueClass}>이메일 주소</span>
              </div>
              <div className="flex items-center px-[14px] py-[9px] border-b border-[#e2e2e2]">
                <span className={tableCellLabelClass}>수집 목적</span>
                <span className={tableCellValueClass}>회원 식별, 로그인, 비밀번호 재설정</span>
              </div>
              <div className="flex items-center px-[14px] py-[9px]">
                <span className={tableCellLabelClass}>보유 기간</span>
                <span className={tableCellValueClass}>회원 탈퇴 시까지</span>
              </div>
            </div>
          </div>

          {errors.root && <p className={fieldErrorClass}>{errors.root.message}</p>}

          <div className="pt-6">
            <CTAButton
              label={isSubmitting ? '가입 중...' : '가입하기'}
              disabled={!agreed || isSubmitting}
            />
          </div>
        </form>

        {/* 하단 링크 */}
        <div className="flex items-center justify-center gap-2 pt-10">
          <span className="text-[14px] text-[#6b6763] leading-[20px]">이미 계정이 있으신가요?</span>
          <Link href={ROUTES.login} className="font-bold text-[14px] text-[#251e19] leading-[20px]">
            로그인
          </Link>
        </div>
      </div>
    </>
  );
}
