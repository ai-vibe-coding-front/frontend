'use client';

import { CTAButton } from "@/components/common/CTAButton";
import MapPinIcon from "@/components/common/MapPinIcon";

interface LocationPermissionModalProps {
  onAllow: () => void;
  onSkip: () => void;
}

export function LocationPermissionModal({ onAllow, onSkip }: LocationPermissionModalProps) {
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50">
      <div className="bg-[#fefefe] rounded-[26px] shadow-[0px_10px_12px_rgba(59,38,20,0.1)] w-[360px] flex flex-col items-center gap-3 p-4">
        <div className="bg-[rgba(245,243,238,0.95)] rounded-full size-12 flex items-center justify-center shrink-0">
          <MapPinIcon className="w-[19px] h-[23px]" />
        </div>

        <div className="flex flex-col items-center gap-0">
          <p className="font-bold text-[24px] text-[#251e19] leading-[31px] text-center">
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

        <div className="flex flex-col gap-2 w-full">
          <CTAButton label="허용하기" onClick={onAllow} />
          <CTAButton label="다음에 하기" onClick={onSkip} className="bg-transparent border border-[#8edfd2]" />
        </div>
      </div>
    </div>
  );
}
