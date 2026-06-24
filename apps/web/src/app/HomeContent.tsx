"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { TodayMoodCard } from "@/features/recommendations/TodayMoodCard";
import { EventCarousel } from "@/features/recommendations/EventCarousel";
import type { EventCardData } from "@/components/common/EventCard";
import { ROUTES } from "@/constants/routes";

const MOCK_EVENTS: EventCardData[] = [
  {
    id: "1",
    realmName: "전시",
    title: "빛으로 쓴 편지 — 사진전",
    place: "성수 갤러리아 포레",
    startDate: new Date("2026-06-01"),
    endDate: new Date("2026-06-30"),
    imageUrl: null,
    isFavorite: true,
  },
  {
    id: "2",
    realmName: "음악/콘서트",
    title: "서울 재즈 페스티벌 2026",
    place: "올림픽공원 88잔디마당",
    startDate: new Date("2026-05-23"),
    endDate: new Date("2026-05-25"),
    imageUrl: null,
    isFavorite: false,
  },
  {
    id: "3",
    realmName: "연극",
    title: "햄릿 — 국립극단",
    place: "명동예술극장",
    startDate: new Date("2026-06-10"),
    endDate: new Date("2026-07-05"),
    imageUrl: null,
    isFavorite: false,
  },
  {
    id: "4",
    realmName: "행사/축제",
    title: "한강 달빛 마켓",
    place: "여의도 한강공원",
    startDate: new Date("2026-06-14"),
    endDate: new Date("2026-06-15"),
    imageUrl: null,
    isFavorite: true,
  },
  {
    id: "5",
    realmName: "뮤지컬/오페라",
    title: "레미제라블",
    place: "예술의전당 오페라극장",
    startDate: new Date("2026-06-20"),
    endDate: new Date("2026-08-31"),
    imageUrl: null,
    isFavorite: false,
  },
  {
    id: "6",
    realmName: "무용/발레",
    title: "지젤 — 국립발레단",
    place: "예술의전당 CJ토월극장",
    startDate: new Date("2026-06-25"),
    endDate: new Date("2026-06-29"),
    imageUrl: null,
    isFavorite: false,
  },
];

interface HomeContentProps {
  isLoggedIn: boolean;
}

export function HomeContent({ isLoggedIn }: HomeContentProps) {
  const router = useRouter();

  const goToLocationPermission = () => {
    router.push(ROUTES.locationPermission);
  };

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[#f0ebe3]">
      <div className="relative flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-[#f9f4ec] shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)]">
        <header className="sticky top-0 z-10 bg-[#f9f4ec] px-6 pt-6 pb-3">
          <Header />
        </header>

        <main className={`flex-1 overflow-y-auto no-scrollbar px-6 pb-4 flex flex-col gap-4 ${!isLoggedIn ? "justify-center" : ""}`}>
          <TodayMoodCard
            isLoggedIn={isLoggedIn}
            userName="회원"
            onCTAClick={
              isLoggedIn
                ? goToLocationPermission
                : () => router.push(`${ROUTES.login}?redirect=${ROUTES.locationPermission}`)
            }
            onGuestClick={goToLocationPermission}
          />

          {isLoggedIn && (
            <div className="flex flex-col gap-3">
              <h2 className="font-bold text-base text-[#3f2a24] leading-6">
                최근 추천 결과
              </h2>
              <EventCarousel events={MOCK_EVENTS} />
            </div>
          )}
        </main>

        <BottomNav activeTab="home" />
      </div>
    </div>
  );
}
