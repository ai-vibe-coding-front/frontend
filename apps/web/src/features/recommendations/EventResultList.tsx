'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { EventCard } from "@/components/common/EventCard";
import type { EventCardData } from "@/components/common/EventCard";
import { ROUTES } from "@/constants/routes";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { LoginGuardModal } from "@/features/event-detail/components/LoginGuardModal";
import type { RecommendationRunDetail } from "@/features/recommendations/types";

interface EventResultListProps {
  events: EventCardData[];
  runId: string;
}

export function EventResultList({ events, runId }: EventResultListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [items, setItems] = useState(events);
  // 카드별 in-flight 요청 추적 → 같은 카드 연타 시 중복 호출 방지
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  // 401 외 실패 카드 추적 → 카드별 독립적으로 에러 메시지 노출 (다른 카드 상태에 영향 없음)
  const [errorIds, setErrorIds] = useState<Set<string>>(() => new Set());
  // 비로그인 클릭 또는 401 응답 시 로그인 모달을 띄울 대상 eventId (#131 FavoriteButton 패턴과 동일)
  const [authRequiredEventId, setAuthRequiredEventId] = useState<string | null>(null);

  const isLoggedIn = () =>
    typeof document !== "undefined" &&
    document.cookie.split(";").some((c) => c.trim().startsWith("isLoggedIn="));

  const setCachedFavorite = (eventId: string, isFavorited: boolean) => {
    queryClient.setQueryData<RecommendationRunDetail>(
      ["recommendation-run", runId],
      (old) =>
        old && {
          ...old,
          items: old.items.map((item) =>
            item.eventItem.id === eventId ? { ...item, isFavorited } : item,
          ),
        },
    );
  };

  const handleFavorite = async (eventId: string, isFavorite: boolean | undefined) => {
    if (!isLoggedIn()) {
      setAuthRequiredEventId(eventId);
      return;
    }

    if (pendingIds.has(eventId)) return;

    setPendingIds((current) => new Set(current).add(eventId));
    setErrorIds((current) => {
      if (!current.has(eventId)) return current;
      const next = new Set(current);
      next.delete(eventId);
      return next;
    });
    setItems((current) =>
      current.map((item) =>
        item.id === eventId ? { ...item, isFavorite: !isFavorite } : item,
      ),
    );
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
      setItems((current) =>
        current.map((item) =>
          item.id === eventId ? { ...item, isFavorite } : item,
        ),
      );
      setCachedFavorite(eventId, Boolean(isFavorite));

      if (error instanceof ApiClientError && error.status === 401) {
        setAuthRequiredEventId(eventId);
      } else {
        setErrorIds((current) => new Set(current).add(eventId));
      }
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(eventId);
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((event) => (
        <div key={event.id} className="relative">
          <EventCard
            event={event}
            onClick={() => router.push(ROUTES.eventDetail(event.id))}
            onFavorite={() => handleFavorite(event.id, event.isFavorite)}
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
