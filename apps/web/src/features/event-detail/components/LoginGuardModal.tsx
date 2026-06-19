'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

type Props = {
  eventId: string;
  onClose: () => void;
};

export function LoginGuardModal({ eventId, onClose }: Props) {
  const router = useRouter();

  const handleLogin = () => {
    router.push(`${ROUTES.login}?redirect=${ROUTES.eventDetail(eventId)}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-[#fbf9f4] rounded-[24px] mx-6 p-6 flex flex-col gap-5 shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <p className="font-bold text-[18px] text-[#3f2a24] leading-[25.2px] tracking-[-0.72px]">
            로그인이 필요해요
          </p>
          <p className="font-normal text-[14px] text-[#6b6763] leading-[21px]">
            관심 행사를 저장하려면 로그인해주세요
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleLogin}
            className="bg-[#8edfd2] w-full h-[48px] rounded-[16px] font-bold text-[16px] text-[#245b6b] tracking-[-0.32px]"
          >
            로그인하기
          </button>
          <button
            onClick={onClose}
            className="w-full h-[48px] rounded-[16px] font-medium text-[15px] text-[#6b6763]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
