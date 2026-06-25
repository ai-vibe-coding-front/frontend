'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { CTAButton } from '@/components/common/CTAButton';

type Props = {
  redirectPath: string;
  onClose: () => void;
};

export function LoginGuardModal({ redirectPath, onClose }: Props) {
  const router = useRouter();

  const handleLogin = () => {
    router.push(`${ROUTES.login}?redirect=${redirectPath}`);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="bg-[#fefefe] rounded-[26px] shadow-[0px_10px_12px_rgba(59,38,20,0.1)] w-[360px] flex flex-col items-center gap-3 p-4"
      >
        <div className="bg-[rgba(245,243,238,0.95)] rounded-full size-12 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 17S3 12.5 3 7.5A4 4 0 0 1 10 5a4 4 0 0 1 7 2.5C17 12.5 10 17 10 17Z"
              fill="none"
              stroke="#8c6e63"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-0">
          <p id="login-modal-title" className="font-bold text-[24px] text-[#251e19] leading-[31px] text-center">
            로그인이 필요해요
          </p>
        </div>

        <div className="flex flex-col items-center">
          <p className="font-medium text-[13px] text-[#4d4540] leading-[19px] text-center">
            관심 행사를 저장하려면 로그인해주세요
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <CTAButton label="로그인하기" onClick={handleLogin} />
          <CTAButton label="닫기" onClick={onClose} className="bg-transparent border border-[#8edfd2]" />
        </div>
      </div>
    </div>
  );
}
