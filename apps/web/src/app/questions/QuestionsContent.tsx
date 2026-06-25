'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { QUESTIONS, type Answers } from "./questions";
import { GuestLimitModal } from "./GuestLimitModal";
import { ApiClientError } from "@/lib/api-client";
import { useExplorationSessionMe } from "./hooks/useExplorationSessionMe";
import { useRecommendationSubmit } from "./hooks/useRecommendationSubmit";

const slideVariants = {
  enter: (d: number) => ({ x: `${d * 60}%`, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: `${d * -60}%`, opacity: 0 }),
};

const TOTAL_STEPS = QUESTIONS.length;

export function QuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({ q1: null, q2: null, q3: null, q4: null });
  const [showModal, setShowModal] = useState(false);

  const { data: sessionMeData } = useExplorationSessionMe();
  const isBlocked = sessionMeData?.hasUsed ?? false;

  const { mutate: submitAnswers, isPending: isSubmitting } = useRecommendationSubmit();

  const question = QUESTIONS[step];
  const isFirst = step === 0;
  const isLast = step === TOTAL_STEPS - 1;
  const currentAnswer = answers[question.key];

  const goNext = () => {
    if (!currentAnswer || isBlocked || isSubmitting) return;
    if (isLast) {
      const lat = searchParams.get("lat");
      const lng = searchParams.get("lng");
      const nx = searchParams.get("nx");
      const ny = searchParams.get("ny");
      submitAnswers(
        {
          answers,
          location: {
            lat: lat ? parseFloat(lat) : undefined,
            lng: lng ? parseFloat(lng) : undefined,
            nx: nx ? parseInt(nx, 10) : undefined,
            ny: ny ? parseInt(ny, 10) : undefined,
            sido: searchParams.get("sido") ?? undefined,
            address: searchParams.get("label") ?? undefined,
            stationName: searchParams.get("stationName") ?? undefined,
          },
        },
        {
          onError: (err) => {
            if (err instanceof ApiClientError && err.status === 403) setShowModal(true);
          },
        },
      );
    } else {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const selectAnswer = (value: string) => {
    if (isBlocked) {
      setShowModal(true);
      return;
    }
    setAnswers((prev) => ({ ...prev, [question.key]: value as never }));
  };

  return (
    <main className="h-dvh flex flex-col overflow-hidden bg-[#fbf9f4]">
      {showModal && <GuestLimitModal onClose={() => setShowModal(false)} />}

      {/* TopAppBar */}
      <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] flex items-center px-6 relative shrink-0">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="size-4 shrink-0"
        >
          <img src="/icons/back-arrow.svg" alt="홈으로" className="size-full" />
        </button>
        <p className="absolute inset-0 flex items-center justify-center font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">
          큐레이션
        </p>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 flex flex-col px-6 pb-6 overflow-hidden">

        {/* 진행바 */}
        <div className="flex flex-col pt-4 pb-1 shrink-0">
          <div className="bg-[#c2ede7] h-[5px] rounded-full w-full">
            <div
              className="h-[5px] rounded-full bg-gradient-to-r from-[#8edfd2] to-[#5bbfb0] transition-all duration-300"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-[12px] text-[#8c6e63] leading-[18px]">질문 {step + 1}/{TOTAL_STEPS}</span>
            <span className="text-[12px] text-[#8c6e63] leading-[18px]">{TOTAL_STEPS - step - 1}단계 남음</span>
          </div>
        </div>

        {/* 질문 카드 (슬라이드) */}
        <div className="flex-1 overflow-hidden pt-5">
          <AnimatePresence mode="sync" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="flex flex-col h-full"
            >
              {/* 질문 헤더 */}
              <div className="flex flex-col pb-4 shrink-0">
                <p className="font-bold text-[22px] text-[#251e19] tracking-[-0.6px] leading-[30.8px]">
                  Q{step + 1}. {question.question}
                </p>
              </div>

              {/* 선택지 */}
              <div className="flex flex-col gap-3 overflow-y-auto" role="radiogroup" aria-label={question.question}>
                {question.choices.map((choice) => {
                  const isActive = currentAnswer === choice.value;
                  return (
                    <button
                      key={choice.value}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => selectAnswer(choice.value)}
                      className={`flex items-center gap-4 min-h-[71px] px-[17.5px] py-4 rounded-[16px] w-full text-left transition-all active:scale-95 ${
                        isActive
                          ? "bg-[#edfaf7] border border-[#8edfd2] shadow-[0px_2px_6px_rgba(91,191,176,0.15)]"
                          : "bg-white border border-[#ded0be] shadow-[0px_1px_2px_rgba(59,38,20,0.06)]"
                      }`}
                    >
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
                      <span className={`flex-1 font-medium text-[15px] tracking-[-0.3px] leading-[22.5px] ${
                        isActive ? "text-[#245b6b]" : "text-[#3f2a24]"
                      }`}>
                        {choice.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="bg-[rgba(251,249,244,0.9)] shadow-[0px_-4px_4px_0px_rgba(0,0,0,0.05)] shrink-0">
        <div className="flex gap-3 p-6">
          {!isFirst && (
            <button
              type="button"
              onClick={goPrev}
              className="flex-1 bg-[#fefefe] border border-[#8edfd2] rounded-[16px] py-[13px] flex items-center justify-center shadow-[0px_10px_12px_rgba(59,38,20,0.1)]"
            >
              <span className="font-semibold text-[14px] text-[#245b6b] leading-[21px]">이전</span>
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={!currentAnswer || isSubmitting}
            className={`flex-1 bg-[#8edfd2] rounded-[16px] py-3 flex items-center justify-center shadow-[0px_10px_12px_rgba(59,38,20,0.1)] transition-opacity ${
              currentAnswer && !isSubmitting ? "opacity-100" : "opacity-50 cursor-not-allowed"
            }`}
          >
            <span className="font-semibold text-[14px] text-[#245b6b] leading-[21px]">
              {isLast ? "결과 확인하기" : "다음"}
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}
