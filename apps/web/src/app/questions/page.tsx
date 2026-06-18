'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Option {
  id: string;
  label: string;
}

const OPTIONS: Option[] = [
  { id: "A", label: "조용히 몰입하고 싶어요" },
  { id: "B", label: "새로운 걸 발견하고 싶어요" },
  { id: "C", label: "활기를 얻고 싶어요" },
  { id: "D", label: "위로받고 싶고 싶어요" },
];

const TOTAL_STEPS = 5;
const CURRENT_STEP = 1;

const optionLabelActiveClass = "bg-[#d4f5ef] text-[#245b6b]";
const optionLabelInactiveClass = "bg-[#f5ede0] text-[#8c6e63]";
const optionTextActiveClass = "text-[#245b6b]";
const optionTextInactiveClass = "text-[#3f2a24]";

export default function QuestionsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();
  const hasSelected = selected !== null;

  return (
    <main className="h-dvh flex flex-col overflow-hidden bg-[#fbf9f4]">

        {/* TopAppBar */}
        <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] flex items-center px-6 relative shrink-0">
          <button type="button" onClick={() => router.back()} className="size-4 shrink-0">
            <img src="/icons/back-arrow.svg" alt="뒤로가기" className="size-full" />
          </button>
          <p className="absolute inset-0 flex items-center justify-center font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">
            큐레이션
          </p>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 flex flex-col px-6 pb-6 overflow-y-auto">

          {/* 진행바 */}
          <div className="flex flex-col pt-4 pb-1 shrink-0">
            <div className="bg-[#c2ede7] h-[5px] rounded-full w-full">
              <div
                className="h-[5px] rounded-full bg-gradient-to-r from-[#8edfd2] to-[#5bbfb0] transition-all"
                style={{ width: `${(CURRENT_STEP / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[12px] text-[#8c6e63] leading-[18px]">질문 {CURRENT_STEP}/{TOTAL_STEPS}</span>
              <span className="text-[12px] text-[#8c6e63] leading-[18px]">{TOTAL_STEPS - CURRENT_STEP}단계 남음</span>
            </div>
          </div>

          {/* 질문 헤더 */}
          <div className="flex flex-col pt-5 pb-4 shrink-0">
            <span className="font-bold text-[13px] text-[#7d543c] tracking-[-0.3px] leading-[19.5px]">
              Q{CURRENT_STEP} · 오늘의 무드
            </span>
            <p className="font-bold text-[22px] text-[#251e19] tracking-[-0.6px] leading-[30.8px] pt-2">
              지금 나의 무드는 어떤가요?
            </p>
          </div>

          {/* 선택지 */}
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="오늘의 무드 선택">
            {OPTIONS.map((option) => {
              const isActive = selected === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setSelected(option.id)}
                  className={`flex items-center gap-4 h-[71px] px-[17.5px] rounded-[16px] w-full transition-all ${
                    isActive
                      ? "bg-[#edfaf7] border border-[#8edfd2] shadow-[0px_2px_6px_rgba(91,191,176,0.15)]"
                      : "bg-white border border-[#ded0be] shadow-[0px_1px_2px_rgba(59,38,20,0.06)]"
                  }`}
                >
                  <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${isActive ? optionLabelActiveClass : optionLabelInactiveClass}`}>
                    <span className="font-bold text-[13px] leading-[19.5px]">{option.id}</span>
                  </div>

                  <span className={`flex-1 font-medium text-[15px] tracking-[-0.3px] leading-[22.5px] text-left ${isActive ? optionTextActiveClass : optionTextInactiveClass}`}>
                    {option.label}
                  </span>

                  <div className="size-[22px] rounded-full flex items-center justify-center shrink-0 relative">
                    {isActive ? (
                      <>
                        <div className="bg-[#8edfd2] size-[10px] rounded-full" />
                        <div className="absolute border-2 border-[#8edfd2] size-[22px] rounded-full" />
                      </>
                    ) : (
                      <div className="border-2 border-[#ded0be] size-[22px] rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="bg-[rgba(251,249,244,0.9)] shadow-[0px_-4px_4px_0px_rgba(0,0,0,0.05)] shrink-0">
          <div className="flex gap-3 p-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-[#fefefe] border border-[#8edfd2] rounded-[16px] py-[13px] flex items-center justify-center shadow-[0px_10px_12px_rgba(59,38,20,0.1)]"
            >
              <span className="font-semibold text-[14px] text-[#245b6b] leading-[21px]">이전</span>
            </button>
            <button
              type="button"
              disabled={!hasSelected}
              className={`flex-1 bg-[#8edfd2] rounded-[16px] py-3 flex items-center justify-center shadow-[0px_10px_12px_rgba(59,38,20,0.1)] transition-opacity ${hasSelected ? "opacity-100" : "opacity-50"}`}
            >
              <span className="font-semibold text-[14px] text-[#245b6b] leading-[21px]">다음</span>
            </button>
          </div>
        </div>
    </main>
  );
}
