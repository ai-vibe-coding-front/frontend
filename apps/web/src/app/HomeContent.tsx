"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { TodayMoodCard } from "@/features/recommendations/TodayMoodCard";
import { EventCarousel } from "@/features/recommendations/EventCarousel";
import { useRecentRecommendations } from "@/features/recommendations/hooks/useRecentRecommendations";
import { ROUTES } from "@/constants/routes";

interface HomeContentProps {
  isLoggedIn: boolean;
}

export function HomeContent({ isLoggedIn }: HomeContentProps) {
  const router = useRouter();
  const recent = useRecentRecommendations(isLoggedIn);
  const mainClassName = [
    "flex-1 overflow-y-auto no-scrollbar px-6 pb-4 flex flex-col gap-4",
    !isLoggedIn ? "justify-center" : "",
  ].join(" ");

  const goToLocationPermission = () => {
    router.push(ROUTES.locationPermission);
  };

  const goToLogin = () => {
    router.push(ROUTES.login);
  };

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[#f0ebe3]">
      <div className="relative flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-[#f9f4ec] shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)]">
        <header className="sticky top-0 z-10 bg-[#f9f4ec] px-6 pt-6 pb-3">
          <Header />
        </header>

        <main className={mainClassName}>
          <TodayMoodCard
            isLoggedIn={isLoggedIn}
            userName="회원"
            onCTAClick={isLoggedIn ? goToLocationPermission : goToLogin}
            onGuestClick={goToLocationPermission}
          />

          {isLoggedIn && (
            <div className="flex flex-col gap-3">
              <h2 className="font-bold text-base text-[#3f2a24] leading-6">
                최근 추천 결과
              </h2>

              {recent.isLoading ? (
                <div className="h-[286px] w-full animate-pulse rounded-[20px] bg-[#eee7df]" />
              ) : (
                <EventCarousel
                  events={recent.events}
                  onItemClick={(event) => router.push(ROUTES.eventDetail(event.id))}
                  onFavorite={recent.toggleFavorite}
                />
              )}

              {recent.errorMessage && (
                <p className="text-center text-[13px] leading-5 text-red-600">
                  {recent.errorMessage}
                </p>
              )}
            </div>
          )}
        </main>

        <BottomNav activeTab="home" />
      </div>
    </div>
  );
}
