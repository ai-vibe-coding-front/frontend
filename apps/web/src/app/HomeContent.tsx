"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { TodayMoodCard } from "@/features/recommendations/TodayMoodCard";
import { EventCarousel } from "@/features/recommendations/EventCarousel";
import type { EventCardData } from "@/components/common/EventCard";
import { ROUTES } from "@/constants/routes";
import { apiClient } from "@/lib/api-client";

interface RecentRecommendationItem {
  recommendationRunId: string;
  rank: number;
  eventItemId: string;
  title: string;
  realmName: string | null;
  place: string | null;
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  isFavorited: boolean;
}

interface RecentRecommendationsResponse {
  runId: string | null;
  curation: string | null;
  items: RecentRecommendationItem[];
}

interface RecentRecommendationCard extends EventCardData {
  recommendationRunId: string | null;
}

function toDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

function toEventCardData(item: RecentRecommendationItem): RecentRecommendationCard {
  return {
    id: item.eventItemId,
    title: item.title,
    realmName: item.realmName,
    place: item.place,
    startDate: toDate(item.startDate),
    endDate: toDate(item.endDate),
    imageUrl: item.imageUrl,
    isFavorite: item.isFavorited,
    recommendationRunId: item.recommendationRunId,
  };
}

interface HomeContentProps {
  isLoggedIn: boolean;
}

export function HomeContent({ isLoggedIn }: HomeContentProps) {
  const router = useRouter();
  const [recentEvents, setRecentEvents] = useState<RecentRecommendationCard[]>([]);
  const [isRecentLoading, setIsRecentLoading] = useState(false);
  const [recentErrorMessage, setRecentErrorMessage] = useState<string | null>(null);
  const [pendingFavoriteIds, setPendingFavoriteIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!isLoggedIn) {
      setRecentEvents([]);
      setRecentErrorMessage(null);
      setIsRecentLoading(false);
      return;
    }

    let ignore = false;

    setIsRecentLoading(true);
    setRecentErrorMessage(null);

    apiClient<RecentRecommendationsResponse>("/api/recommendations/recent")
      .then((data) => {
        if (ignore) return;
        setRecentEvents(data.items.map(toEventCardData));
      })
      .catch(() => {
        if (ignore) return;
        setRecentEvents([]);
        setRecentErrorMessage("최근 추천 결과를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (ignore) return;
        setIsRecentLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [isLoggedIn]);

  const goToLocationPermission = () => {
    router.push(ROUTES.locationPermission);
  };

  const handleFavorite = async (event: EventCardData) => {
    if (pendingFavoriteIds.has(event.id)) return;

    const currentEvent = recentEvents.find((item) => item.id === event.id);
    if (!currentEvent) return;

    const nextIsFavorite = !currentEvent.isFavorite;

    setPendingFavoriteIds((prev) => new Set(prev).add(event.id));
    setRecentEvents((prev) =>
      prev.map((item) =>
        item.id === event.id ? { ...item, isFavorite: nextIsFavorite } : item,
      ),
    );
    setRecentErrorMessage(null);

    try {
      if (nextIsFavorite) {
        await apiClient<{ eventItemId: string; isFavorited: boolean }>("/api/favorites", {
          method: "POST",
          body: JSON.stringify({
            eventItemId: event.id,
            recommendationRunId: currentEvent.recommendationRunId ?? undefined,
          }),
        });
      } else {
        await apiClient<{ eventItemId: string; isFavorited: boolean }>(`/api/favorites/${event.id}`, {
          method: "DELETE",
        });
      }
    } catch {
      setRecentEvents((prev) =>
        prev.map((item) =>
          item.id === event.id ? { ...item, isFavorite: currentEvent.isFavorite } : item,
        ),
      );
      setRecentErrorMessage("관심행사 상태를 변경하지 못했습니다.");
    } finally {
      setPendingFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(event.id);
        return next;
      });
    }
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

              {isRecentLoading ? (
                <div className="h-[286px] w-full animate-pulse rounded-[20px] bg-[#eee7df]" />
              ) : (
                <EventCarousel
                  events={recentEvents}
                  onItemClick={(event) => router.push(ROUTES.eventDetail(event.id))}
                  onFavorite={handleFavorite}
                />
              )}

              {recentErrorMessage && (
                <p role="alert" className="text-center text-[13px] leading-5 text-red-600">
                  {recentErrorMessage}
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
