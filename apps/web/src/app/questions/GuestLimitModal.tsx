'use client';

import { useRouter } from 'next/navigation';

interface GuestLimitModalProps {
  onClose: () => void;
}

export function GuestLimitModal({ onClose }: GuestLimitModalProps) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-limit-modal-title"
        className="bg-[#fefefe] rounded-[26px] shadow-[0px_10px_12px_rgba(59,38,20,0.1)] w-[360px] flex flex-col items-center gap-3 p-4"
      >
        <div className="flex flex-col items-center gap-0">
          <p id="guest-limit-modal-title" className="font-bold text-[24px] text-[#251e19] leading-[31px] text-center">
            1회 체험이
          </p>
          <p className="font-bold text-[24px] text-[#251e19] leading-[31px] text-center">
            완료됐습니다
          </p>
        </div>

        <div className="flex flex-col items-center">
          <p className="font-medium text-[13px] text-[#4d4540] leading-[19px] text-center">
            로그인하면 횟수 제한 없이
          </p>
          <p className="font-medium text-[13px] text-[#4d4540] leading-[19px] text-center">
            이용할 수 있어요
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full bg-[#8edfd2] rounded-[16px] py-[13px] flex items-center justify-center shadow-[0px_10px_12px_rgba(59,38,20,0.1)]"
          >
            <span className="font-semibold text-[14px] text-[#245b6b] leading-[21px]">
              로그인하기
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-transparent border border-[#8edfd2] rounded-[16px] py-[13px] flex items-center justify-center"
          >
            <span className="font-semibold text-[14px] text-[#245b6b] leading-[21px]">
              닫기
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
