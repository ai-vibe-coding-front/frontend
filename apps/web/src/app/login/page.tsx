'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { CTAButton } from "@/components/common/CTAButton";
import { Input } from "@/components/common/Input";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { ROUTES } from "@/constants/routes";

type LoginFormData = {
  email: string;
  password: string;
};

const headingClass = "font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[31.2px]";
const subtitleClass = "font-medium text-[16px] text-[#6b6763] leading-[22.4px]";
const dividerClass = "bg-[#e2e2e2] h-px flex-1";
const fieldErrorClass = "text-[12px] text-red-500 leading-[18px] pl-1";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await apiClient<{ user: { id: string; email: string; nickname: string } }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email: data.email, password: data.password }),
        },
      );
      router.push(ROUTES.home);
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.errorCode === 'USER_NOT_FOUND') {
          setError('email', { message: '존재하지 않는 이메일입니다' });
        } else if (error.errorCode === 'INVALID_PASSWORD') {
          setError('password', { message: '비밀번호가 올바르지 않습니다' });
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
      {/* TopAppBar */}
      <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] flex items-center justify-center shrink-0">
        <p className="font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">MUUD</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-3">

        {/* 헤딩 */}
        <div className="flex flex-col gap-[11px] pb-6">
          <p className={headingClass}>다시 만나 반가워요</p>
          <p className={subtitleClass}>이메일로 로그인하고 추천을 이어가세요</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
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
              {...register('password', {
                required: '비밀번호를 입력해주세요',
              })}
            />
            {errors.password && <p className={fieldErrorClass}>{errors.password.message}</p>}
          </div>

          <div className="flex justify-end pt-1">
            <button type="button" className="text-[14px] text-[#6b6763] leading-[20px]">
              비밀번호를 잊으셨나요?
            </button>
          </div>

          {errors.root && <p className={fieldErrorClass}>{errors.root.message}</p>}

          <div className="pt-6">
            <CTAButton
              label={isSubmitting ? '로그인 중...' : '로그인'}
              disabled={isSubmitting}
            />
          </div>
        </form>

        {/* 하단 링크 및 OR 구분선 */}
        <div className="flex flex-col items-center gap-3 pt-10">
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-[#6b6763] leading-[20px]">아직 계정이 없나요?</span>
            <Link href={ROUTES.signup} className="font-bold text-[14px] text-[#251e19] leading-[20px]">
              회원가입
            </Link>
          </div>

          <div className="flex items-center gap-4 w-full py-4">
            <div className={dividerClass} />
            <span className="text-[12px] text-[#6b6763] tracking-[1.2px] uppercase leading-[16px]">OR</span>
            <div className={dividerClass} />
          </div>

          <CTAButton
            label="로그인 없이 시작하기"
            className="bg-transparent border border-[#8edfd2]"
          />
        </div>
      </div>
    </>
  );
}
