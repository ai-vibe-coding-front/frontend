'use client';

import { CTAButton } from "@/components/common/CTAButton";
import MapPinIcon from "@/components/common/MapPinIcon";

interface LocationPermissionModalProps {
  onAllow: () => void;
  onSkip: () => void;
  isAllowLoading?: boolean;
  errorMessage?: string | null;
}

export function LocationPermissionModal({
  onAllow,
  onSkip,
  isAllowLoading = false,
  errorMessage,
}: LocationPermissionModalProps) {
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
        className="bg-[#fefefe] rounded-[26px] shadow-[0px_10px_12px_rgba(59,38,20,0.1)] w-[360px] flex flex-col items-center gap-3 p-4"
      >
        <div className="bg-[rgba(245,243,238,0.95)] rounded-full size-12 flex items-center justify-center shrink-0">
          <MapPinIcon className="w-[19px] h-[23px]" />
        </div>

        <div className="flex flex-col items-center gap-0">
          <p id="location-modal-title" className="font-bold text-[24px] text-[#251e19] leading-[31px] text-center">
            정확한 추천을 위해
          </p>
          <p className="font-bold text-[24px] text-[#251e19] leading-[31px] text-center">
            위치 정보가 필요해요
          </p>
        </div>

        <div className="flex flex-col items-center">
          <p className="font-medium text-[13px] text-[#4d4540] leading-[19px] text-center">
            현재 계신 곳의 날씨와 대기질을 분석하여 딱 맞는
          </p>
          <p className="font-medium text-[13px] text-[#4d4540] leading-[19px] text-center">
            문화 행사를 추천해 드릴게요.
          </p>
        </div>
        {errorMessage && (
          <p
            role="status"
            className="font-medium text-[13px] text-[#dc2626] leading-[19px] text-center"
          >
            {errorMessage}
          </p>
        )}

        <div className="flex flex-col gap-2 w-full">
          <button
            type="button"
            onClick={onAllow}
            disabled={isAllowLoading}
            aria-busy={isAllowLoading}
            aria-live="polite"
            className="bg-[#8edfd2] w-full flex items-center justify-center gap-2 px-[88px] py-3 rounded-2xl shadow-[0px_10px_12px_rgba(59,38,20,0.1)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isAllowLoading && (
              <span
                aria-hidden="true"
                className="size-4 rounded-full border-2 border-[#245b6b]/30 border-t-[#245b6b] animate-spin"
              />
            )}
            <span className="font-semibold text-sm text-[#245b6b] leading-[21px] whitespace-nowrap">
              {isAllowLoading ? "위치 확인 중..." : "허용하기"}
            </span>
          </button>
          <CTAButton label="다음에 하기" onClick={onSkip} className="bg-transparent border border-[#8edfd2]" />
        </div>
      </div>
    </div>
  );
}
