'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/common/Input';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { ROUTES } from '@/constants/routes';

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
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    defaultValues: { nickname: '', email: '', password: '', passwordConfirm: '', agreed: false },
    mode: 'onChange',
  });

  const agreed = watch('agreed');
  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    try {
      await apiClient<{ user: { id: string; email: string; nickname: string } }>(
        '/api/auth/signup',
        {
          method: 'POST',
          body: JSON.stringify({ email: data.email, password: data.password, nickname: data.nickname }),
        },
      );
      // TODO: signup_completed 이벤트 로그 수집 (API 구현 후 연결)
      router.push(ROUTES.onboarding);
    } catch (error) {
      if (error instanceof ApiClientError && error.errorCode === 'EMAIL_ALREADY_EXISTS') {
        setError('email', { message: '이미 사용 중인 이메일입니다' });
      }
    }
  };

  return (
    <>
      {/* TopAppBar */}
      <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] flex items-center justify-center shrink-0">
        <p className="font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">MUUD</p>
      </div>

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
            <Controller
              name="nickname"
              control={control}
              rules={{
                required: '닉네임을 입력해주세요',
                maxLength: { value: 20, message: '닉네임은 20자 이하로 입력해주세요' },
              }}
              render={({ field }) => (
                <Input placeholder="닉네임" value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.nickname && <p className={fieldErrorClass}>{errors.nickname.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <Controller
              name="email"
              control={control}
              rules={{
                required: '이메일을 입력해주세요',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '올바른 이메일 주소를 입력해주세요' },
              }}
              render={({ field }) => (
                <Input placeholder="이메일" type="email" value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.email && <p className={fieldErrorClass}>{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <Controller
              name="password"
              control={control}
              rules={{
                required: '비밀번호를 입력해주세요',
                minLength: { value: 8, message: '비밀번호는 8자 이상이어야 합니다' },
                pattern: { value: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: '영문과 숫자를 조합해주세요' },
              }}
              render={({ field }) => (
                <Input placeholder="비밀번호" type="password" value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.password && <p className={fieldErrorClass}>{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <Controller
              name="passwordConfirm"
              control={control}
              rules={{
                required: '비밀번호 확인을 입력해주세요',
                validate: (value) => value === password || '비밀번호가 일치하지 않습니다',
              }}
              render={({ field }) => (
                <Input placeholder="비밀번호 확인" type="password" value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.passwordConfirm && <p className={fieldErrorClass}>{errors.passwordConfirm.message}</p>}
          </div>

          {/* 개인정보 수집동의 */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => setValue('agreed', !agreed)}
              className="flex items-center gap-[10px]"
            >
              <div className={`size-[18px] rounded-[5px] border shrink-0 flex items-center justify-center transition-colors ${agreed ? 'bg-[#8edfd2] border-[#8edfd2]' : 'bg-white border-[#e2e2e2]'}`}>
                {agreed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#245b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[13px] text-[rgba(35,39,47,0.45)] leading-[19.5px]">
                (필수) 개인정보 수집동의
              </span>
            </button>

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

          <div className="pt-6">
            <button
              type="submit"
              disabled={!agreed || isSubmitting}
              className="bg-[#8edfd2] w-full flex items-center justify-center px-[88px] py-3 rounded-2xl shadow-[0px_10px_12px_rgba(59,38,20,0.1)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              <span className="font-semibold text-sm text-[#245b6b] leading-[21px] whitespace-nowrap">
                {isSubmitting ? '가입 중...' : '가입하기'}
              </span>
            </button>
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
