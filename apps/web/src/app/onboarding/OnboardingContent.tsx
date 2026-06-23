'use client';

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { TodayMoodCard } from "@/features/recommendations/TodayMoodCard";
import { EventCard } from "@/components/common/EventCard";
import type { EventCardData } from "@/components/common/EventCard";
import { LocationPermissionModal } from "@/components/common/LocationPermissionModal";

const MOCK_EVENT: EventCardData = {
  id: "1",
  realmName: "전시",
  title: "빛으로 쓴 편지 — 사진전",
  place: "성수 갤러리아 포레",
  startDate: new Date("2026-06-01"),
  endDate: new Date("2026-06-30"),
  imageUrl: null,
  isFavorite: false,
};

const dotClass = "rounded-full bg-[#e4d8c9] size-[6px] shrink-0";

export function OnboardingContent() {
  const searchParams = useSearchParams();
  const isLoggedIn = searchParams.get("loggedIn") === "true";
  const userName = searchParams.get("user") ?? "성우";

  const [showLocationModal, setShowLocationModal] = useState(false);

  return (
    <div className="bg-[#f0ebe3] h-screen flex items-center justify-center">
      <div className="bg-[#f9f4ec] w-[390px] h-screen shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)] flex flex-col">
        <div className="p-6">
          <Header />
        </div>

        <div className={`flex-1 flex flex-col px-6 pb-6 overflow-y-auto ${isLoggedIn ? "gap-4" : "justify-center"}`}>
          <TodayMoodCard
            isLoggedIn={isLoggedIn}
            userName={userName}
            onCTAClick={() => setShowLocationModal(true)}
            onGuestClick={() => setShowLocationModal(true)}
          />

          {isLoggedIn && (
            <div className="flex flex-col gap-3">
              <p className="font-bold text-[16px] text-[#3f2a24] leading-6">최근 추천 결과</p>
              <EventCard event={MOCK_EVENT} />
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <div className="bg-[#8edfd2] h-[6px] w-[18px] rounded-full shrink-0" />
                <div className={dotClass} />
                <div className={dotClass} />
                <div className={dotClass} />
                <div className={dotClass} />
                <div className={dotClass} />
                <div className={dotClass} />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0">
          <BottomNav activeTab="home" />
        </div>
      </div>

      {showLocationModal && (
        <LocationPermissionModal
          onAllow={() => setShowLocationModal(false)}
          onSkip={() => setShowLocationModal(false)}
        />
      )}
    </div>
  );
}
