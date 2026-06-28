"use client";

import { memo, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { EventCard, type EventCardData } from "@/components/common/EventCard";
import { ROUTES } from "@/constants/routes";
import { useFavoriteEvents } from "@/app/mypage/favorites/useFavoriteEvents";

function LoadingList() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-[286px] w-full animate-pulse rounded-[20px] bg-[#eee7df]"
        />
      ))}
    </div>
  );
}

const FavoriteEventCard = memo(function FavoriteEventCard({
  event,
  onClick,
  onFavoriteRemove,
}: {
  event: EventCardData;
  onClick: (eventId: string) => void;
  onFavoriteRemove: (eventId: string) => void;
}) {
  const handleClick = useCallback(() => {
    onClick(event.id);
  }, [event.id, onClick]);

  const handleFavorite = useCallback(() => {
    onFavoriteRemove(event.id);
  }, [event.id, onFavoriteRemove]);

  return <EventCard event={event} onClick={handleClick} onFavorite={handleFavorite} />;
});

export function FavoritesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    events,
    isLoading,
    isLoadingMore,
    hasNext,
    errorMessage,
    isUnauthorized,
    loadMore,
    removeFavorite,
  } = useFavoriteEvents();

  useEffect(() => {
    if (isUnauthorized) {
      router.replace(`${ROUTES.login}?redirect=${ROUTES.mypageFavorites}`);
    }
  }, [isUnauthorized, router]);

  const handleEventClick = useCallback(
    (eventId: string) => {
      const nextPath = ROUTES.eventDetail(eventId);
      if (pathname === nextPath) return;
      router.push(nextPath);
    },
    [pathname, router],
  );

  const handleTabChange = useCallback(
    (tab: "home" | "curation" | "recommend" | "my") => {
      const nextPath =
        tab === "home"
          ? ROUTES.home
          : tab === "curation"
            ? ROUTES.questions
            : tab === "recommend"
              ? ROUTES.recommendations
              : ROUTES.mypage;

      if (pathname === nextPath) return;
      router.push(nextPath);
    },
    [pathname, router],
  );

  return (
    <div className="flex h-dvh w-full justify-center overflow-hidden bg-[#f0ebe3]">
      <div className="flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-[rgba(251,249,244,0.95)] shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)]">
        <Header title="관심 행사" backHref={ROUTES.mypage} />

        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4 no-scrollbar">
          {isLoading ? (
            <LoadingList />
          ) : errorMessage && events.length === 0 ? (
            <div
              role="alert"
              className="flex min-h-[320px] flex-col items-center justify-center rounded-[20px] bg-white px-6 text-center"
            >
              <p className="font-bold text-[17px] leading-[26px] text-[#251e19]">
                목록을 불러오지 못했어요
              </p>
              <p className="mt-2 text-[13px] leading-5 text-[#8c6e63]">
                {errorMessage}
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[20px] bg-white px-6 text-center">
              <div className="flex size-16 items-center justify-center rounded-[18px] bg-[#f5ede0]">
                <span className="text-[28px]">♡</span>
              </div>
              <p className="mt-4 font-bold text-[17px] leading-[26px] text-[#251e19]">
                저장한 관심 행사가 없어요
              </p>
              <p className="mt-2 text-[13px] leading-5 text-[#8c6e63]">
                마음에 드는 행사를 저장하면 이곳에서 다시 볼 수 있어요.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {errorMessage && (
                <p role="alert" className="px-1 text-[13px] leading-5 text-red-600">
                  {errorMessage}
                </p>
              )}
              {events.map((event) => (
                <FavoriteEventCard
                  key={event.id}
                  event={event}
                  onClick={handleEventClick}
                  onFavoriteRemove={removeFavorite}
                />
              ))}
              {hasNext && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="mt-1 h-12 rounded-[16px] bg-[#3f2a24] px-4 text-[14px] font-bold leading-5 text-white disabled:opacity-50"
                >
                  {isLoadingMore ? "불러오는 중" : "더보기"}
                </button>
              )}
            </div>
          )}
        </main>

        <div className="shrink-0">
          <BottomNav
            activeTab="my"
            onTabChange={handleTabChange}
          />
        </div>
      </div>
    </div>
  );
}
