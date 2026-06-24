"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { EventCard, type EventCardData } from "@/components/common/EventCard";
import { ApiClientError, apiClient } from "@/lib/api-client";
import { ROUTES } from "@/constants/routes";

const FAVORITES_PATH = "/mypage/favorites";

type FavoriteItem = {
  eventItemId: string;
  title: string;
  realmName: string | null;
  place: string | null;
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  isFavorited?: boolean;
  favoritedAt: string;
};

type FavoritesResponse = {
  items: FavoriteItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
};

function toDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

function toEventCardData(item: FavoriteItem): EventCardData {
  return {
    id: item.eventItemId,
    title: item.title,
    realmName: item.realmName,
    place: item.place,
    startDate: toDate(item.startDate),
    endDate: toDate(item.endDate),
    imageUrl: item.imageUrl,
    isFavorite: item.isFavorited ?? true,
  };
}

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

export function FavoritesContent() {
  const router = useRouter();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    apiClient<FavoritesResponse>("/api/favorites?page=1&limit=20")
      .then((data) => {
        setItems(data.items);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiClientError && error.status === 401) {
          router.replace(`/login?redirect=${FAVORITES_PATH}`);
          return;
        }

        setErrorMessage("관심행사 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const events = useMemo(() => items.map(toEventCardData), [items]);

  const removePendingId = (eventItemId: string) => {
    setPendingIds((current) => {
      const next = new Set(current);
      next.delete(eventItemId);
      return next;
    });
  };

  const handleFavoriteRemove = async (eventItemId: string) => {
    if (pendingIds.has(eventItemId)) return;

    const removedIndex = items.findIndex((item) => item.eventItemId === eventItemId);
    const removedItem = items[removedIndex];
    if (!removedItem) return;

    setPendingIds((current) => new Set(current).add(eventItemId));
    setItems((current) => current.filter((item) => item.eventItemId !== eventItemId));
    setErrorMessage(null);

    try {
      await apiClient<{ eventItemId: string; isFavorited: boolean; favoriteCount: number }>(
        `/api/favorites/${eventItemId}`,
        { method: "DELETE" },
      );
    } catch (error) {
      setItems((current) => [
        ...current.slice(0, removedIndex),
        removedItem,
        ...current.slice(removedIndex),
      ]);

      if (error instanceof ApiClientError && error.status === 401) {
        router.replace(`/login?redirect=${FAVORITES_PATH}`);
        return;
      }

      setErrorMessage("관심행사 해제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      removePendingId(eventItemId);
    }
  };

  return (
    <div className="flex h-dvh w-full justify-center overflow-hidden bg-[#f0ebe3]">
      <div className="flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-[rgba(251,249,244,0.95)] shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)]">
        <div className="flex h-[56px] shrink-0 items-center justify-between bg-[#faf7f2] px-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-10 items-center justify-center rounded-full"
          >
            <Image
              src="/icons/back-arrow.svg"
              alt="뒤로가기"
              width={16}
              height={16}
            />
          </button>
          <p className="font-bold text-[20px] leading-[28px] tracking-[-0.5px] text-[#251e19]">
            관심 행사
          </p>
          <div className="size-10" />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4 no-scrollbar">
          {isLoading ? (
            <LoadingList />
          ) : errorMessage && items.length === 0 ? (
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
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => router.push(ROUTES.eventDetail(event.id))}
                  onFavorite={() => handleFavoriteRemove(event.id)}
                />
              ))}
            </div>
          )}
        </main>

        <div className="shrink-0">
          <BottomNav
            activeTab="my"
            onTabChange={(tab) => {
              if (tab === "home") router.push(ROUTES.home);
              if (tab === "curation") router.push(ROUTES.questions);
              if (tab === "recommend") router.push(ROUTES.recommendations);
              if (tab === "my") router.push(ROUTES.mypage);
            }}
          />
        </div>
      </div>
    </div>
  );
}
