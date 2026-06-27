'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { EventCard } from "@/components/common/EventCard";
import type { EventCardData } from "@/components/common/EventCard";
import { ROUTES } from "@/constants/routes";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { LoginGuardModal } from "@/features/event-detail/components/LoginGuardModal";
import type { RecommendationRunDetail } from "@/features/recommendations/types";
import { queryKeys } from "@/lib/query-keys";

interface EventResultListProps {
  events: EventCardData[];
  runId: string;
}

export function EventResultList({ events, runId }: EventResultListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // 카드별 in-flight 요청 추적 → 같은 카드 연타 시 중복 호출 방지
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  // handleFavorite를 useCallback으로 고정하기 위한 pendingIds 동기 참조 (state는 렌더링용)
  const pendingIdsRef = useRef(pendingIds);
  useEffect(() => {
    pendingIdsRef.current = pendingIds;
  }, [pendingIds]);
  // 401 외 실패 카드 추적 → 카드별 독립적으로 에러 메시지 노출 (다른 카드 상태에 영향 없음)
  const [errorIds, setErrorIds] = useState<Set<string>>(() => new Set());
  // 비로그인 클릭 또는 401 응답 시 로그인 모달을 띄울 대상 eventId (#131 FavoriteButton 패턴과 동일)
  const [authRequiredEventId, setAuthRequiredEventId] = useState<string | null>(null);

  const isLoggedIn = () =>
    typeof document !== "undefined" &&
    document.cookie.split(";").some((c) => c.trim().startsWith("isLoggedIn="));

  const setCachedFavorite = useCallback((eventId: string, isFavorited: boolean) => {
    queryClient.setQueryData<RecommendationRunDetail>(
      queryKeys.recommendations.detail(runId),
      (old) => {
        if (!old) return old;
        const index = old.items.findIndex((item) => item.eventItem.id === eventId);
        if (index === -1) return old;
        const items = old.items.slice();
        items[index] = { ...items[index], isFavorited };
        return { ...old, items };
      },
    );
  }, [queryClient, runId]);

  const handleFavorite = useCallback(async (eventId: string, isFavorite: boolean | undefined) => {
    if (!isLoggedIn()) {
      setAuthRequiredEventId(eventId);
      return;
    }

    if (pendingIdsRef.current.has(eventId)) return;

    setPendingIds((current) => new Set(current).add(eventId));
    setErrorIds((current) => {
      if (!current.has(eventId)) return current;
      const next = new Set(current);
      next.delete(eventId);
      return next;
    });
    setCachedFavorite(eventId, !isFavorite);

    try {
      if (isFavorite) {
        await apiClient(`/api/favorites/${eventId}`, { method: "DELETE" });
      } else {
        await apiClient("/api/favorites", {
          method: "POST",
          body: JSON.stringify({ eventItemId: eventId }),
        });
      }
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        (error.errorCode === "FAVORITE_ALREADY_EXISTS" || error.errorCode === "FAVORITE_NOT_FOUND")
      ) {
        // 캐시가 실제 서버 상태와 어긋나 있던 경우(예: 로그인 전후 재진입) → 서버가 맞다고 하는 상태로 캐시만 맞춰줌
        setCachedFavorite(eventId, error.errorCode === "FAVORITE_ALREADY_EXISTS");
      } else if (error instanceof ApiClientError && error.status === 401) {
        setCachedFavorite(eventId, Boolean(isFavorite));
        setAuthRequiredEventId(eventId);
      } else {
        setCachedFavorite(eventId, Boolean(isFavorite));
        setErrorIds((current) => new Set(current).add(eventId));
      }
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(eventId);
        return next;
      });
    }
  }, [setCachedFavorite]);

  const handleClickEvent = useCallback(
    (eventId: string) => router.push(ROUTES.eventDetail(eventId)),
    [router],
  );

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <div key={event.id} className="relative">
          <EventCard
            event={event}
            onClick={handleClickEvent}
            onFavorite={handleFavorite}
            favoriteDisabled={pendingIds.has(event.id)}
          />
          {errorIds.has(event.id) && (
            <p
              role="alert"
              className="absolute top-[52px] right-3 z-30 text-[11px] text-[#c0392b] bg-[#fefefe] border border-[#ded0be] rounded-[8px] px-2 py-1 whitespace-nowrap shadow-sm"
            >
              잠시 후 다시 시도해주세요.
            </p>
          )}
        </div>
      ))}

      {authRequiredEventId && (
        <LoginGuardModal
          redirectPath={ROUTES.recommendationResult(runId)}
          onClose={() => setAuthRequiredEventId(null)}
        />
      )}
    </div>
  );
}
