'use client';

import { useRouter } from "next/navigation";
import { CTAButton } from "@/components/common/CTAButton";
import { BottomNav } from "@/components/layout/BottomNav";
import MapPinIcon from "@/components/common/MapPinIcon";

export default function LocationPage() {
  const router = useRouter();

  return (
    <div className="bg-[#f0ebe3] min-h-screen flex items-center justify-center">
      <div className="bg-[#fbf9f4] w-[390px] min-h-screen shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)] flex flex-col relative overflow-hidden">

        {/* TopAppBar */}
        <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] flex items-center px-6 relative shrink-0 z-10">
          <button onClick={() => router.back()} className="size-[16px] shrink-0">
            <img src="/icons/back-arrow.svg" alt="뒤로가기" className="size-full" />
          </button>
          <p className="absolute inset-0 flex items-center justify-center font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">
            위치 검색
          </p>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 relative">
          {/* 지도 배경 (실제 지도 라이브러리 연동 시 교체) */}
          <div className="absolute inset-0 bg-[#e8e0d5]" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(251,249,244,0.4) 0%, rgba(251,249,244,0) 20%, rgba(251,249,244,0) 80%, rgba(251,249,244,0.4) 100%)" }}
          />

          {/* 중앙 마커 */}
          <div className="absolute inset-0 flex items-center justify-center pb-[220px]">
            <MapPinIcon className="w-[40px] h-[48px] drop-shadow-[0px_4px_1.5px_rgba(0,0,0,0.1)]" />
          </div>

          {/* 지도 컨트롤 (우측) */}
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-3">
            <div className="bg-white border border-[rgba(207,196,189,0.2)] rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden">
              <button className="size-[48px] flex items-center justify-center border-b border-[rgba(207,196,189,0.1)]">
                <img src="/icons/zoom-in.svg" alt="확대" className="size-[14px]" />
              </button>
              <button className="size-[48px] flex items-center justify-center">
                <img src="/icons/zoom-out.svg" alt="축소" className="w-[14px] h-[2px]" />
              </button>
            </div>
            <button className="bg-white border border-[rgba(207,196,189,0.2)] rounded-[12px] size-[48px] flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
              <img src="/icons/gps.svg" alt="현재 위치" className="size-[22px]" />
            </button>
          </div>

          {/* 하단 정보 카드 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 p-4 w-full">
            <div className="bg-white border border-[rgba(207,196,189,0.3)] rounded-[32px] shadow-[0px_20px_25px_rgba(0,0,0,0.1)] p-[25px] flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-[12px] text-[#6b6763] leading-[18px] tracking-[-0.3px]">
                    현재 설정된 위치
                  </span>
                  <span className="font-bold text-[20px] text-[#251e19] leading-[25px]">
                    서울시 성동구 성수동
                  </span>
                </div>
                <div className="bg-[#f0fdf4] rounded-full px-3 py-1 shrink-0">
                  <span className="font-bold text-[11px] text-[#15803d] leading-[16.5px]">
                    정확도 높음
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-2 border-b border-[rgba(207,196,189,0.2)]">
                <MapPinIcon className="w-[12px] h-[15px] shrink-0" />
                <span className="font-normal text-[14px] text-[#4d4540] leading-[21px]">
                  서울특별시 성동구 아차산로 17길 48
                </span>
              </div>

              <CTAButton label="이 위치로 설정" />
            </div>
          </div>
        </div>

        {/* BottomNav */}
        <div className="shrink-0">
          <BottomNav activeTab="home" />
        </div>
      </div>
    </div>
  );
}
