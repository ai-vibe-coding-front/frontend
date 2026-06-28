"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { TodayMoodCard } from "@/features/recommendations/TodayMoodCard";
import { EventCarousel } from "@/features/recommendations/EventCarousel";
import { useRecentRecommendations } from "@/features/recommendations/hooks/useRecentRecommendations";
import { ROUTES } from "@/constants/routes";

import { useCurrentUser } from "@/features/users/hooks/useCurrentUser";

const FALLBACK_USER_NAME = "회원";

interface HomeContentProps {
  isLoggedIn: boolean;
}

function RecentRecommendationsEmptyState() {
  return (
    <div className="flex min-h-[132px] flex-col items-center justify-center gap-2 rounded-[20px] bg-white px-6 py-7 text-center shadow-[0px_2px_6px_0px_rgba(63,42,36,0.06)]">
      <p className="font-bold text-[17px] leading-6 text-[#251e19]">
        아직 추천 내역이 없어요
      </p>
      <p className="text-[14px] leading-5 text-[#8c6e63]">
        지금 기분에 맞는 문화생활을 추천받아보세요.
      </p>
    </div>
  );
}

export function HomeContent({ isLoggedIn }: HomeContentProps) {
  const router = useRouter();
  const recent = useRecentRecommendations(isLoggedIn);
  const mainClassName = [
    "flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-4",
    !isLoggedIn ? "justify-center" : "",
  ].join(" ");
  const { user } = useCurrentUser(isLoggedIn);
  const userName = user?.nickname || FALLBACK_USER_NAME;

  const goToLocationPermission = useCallback(() => {
    router.push(ROUTES.locationPermission);
  }, [router]);

  const goToLogin = useCallback(() => {
    router.push(`${ROUTES.login}?redirect=${ROUTES.locationPermission}`);
  }, [router]);

  const handleRecentEventClick = useCallback(
    (event: { id: string }) => {
      router.push(ROUTES.eventDetail(event.id));
    },
    [router],
  );

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[#f0ebe3]">
      <div className="relative flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-[#f9f4ec] shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)]">
        <Header title="MUUD" titleHref="/" size="large" />

        <main className={mainClassName}>
          <TodayMoodCard
            isLoggedIn={isLoggedIn}
            onCTAClick={isLoggedIn ? goToLocationPermission : goToLogin}
            userName={userName}
            onGuestClick={goToLocationPermission}
          />

          {isLoggedIn && (
            <div className="flex flex-col gap-3">
              <h2 className="font-bold text-base text-[#3f2a24] leading-6">
                최근 추천 결과
              </h2>

              {recent.isLoading ? (
                <div className="h-[286px] w-full animate-pulse rounded-[20px] bg-[#eee7df]" />
              ) : recent.errorMessage ? (
                <p className="text-center text-[13px] leading-5 text-red-600">
                  {recent.errorMessage}
                </p>
              ) : recent.events.length === 0 ? (
                <RecentRecommendationsEmptyState />
              ) : (
                <EventCarousel
                  events={recent.events}
                  onItemClick={handleRecentEventClick}
                  onFavorite={recent.toggleFavorite}
                />
              )}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
