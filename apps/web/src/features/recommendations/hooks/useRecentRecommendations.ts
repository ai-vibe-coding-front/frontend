"use client";

import { useEffect, useRef, useState } from "react";
import type { EventCardData } from "@/components/common/EventCard";
import { RECENT_RECOMMENDATIONS_LIMIT } from "@/features/recommendations/constants";
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

interface UseRecentRecommendationsResult {
  events: RecentRecommendationCard[];
  isLoading: boolean;
  errorMessage: string | null;
  toggleFavorite: (event: EventCardData) => Promise<void>;
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

export function useRecentRecommendations(enabled: boolean): UseRecentRecommendationsResult {
  const [events, setEvents] = useState<RecentRecommendationCard[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pendingFavoriteIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let ignore = false;

    apiClient<RecentRecommendationsResponse>(
      `/api/recommendations/recent?limit=${RECENT_RECOMMENDATIONS_LIMIT}`,
    )
      .then((data) => {
        if (ignore) return;
        setErrorMessage(null);
        setEvents(data.items.map(toEventCardData));
      })
      .catch(() => {
        if (ignore) return;
        setEvents([]);
        setErrorMessage("최근 추천 결과를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (ignore) return;
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [enabled]);

  const toggleFavorite = async (event: EventCardData) => {
    if (!enabled) return;
    if (pendingFavoriteIdsRef.current.has(event.id)) return;

    const currentEvent = events.find((item) => item.id === event.id);
    if (!currentEvent) return;

    const nextIsFavorite = !currentEvent.isFavorite;

    pendingFavoriteIdsRef.current.add(event.id);
    setEvents((prev) =>
      prev.map((item) =>
        item.id === event.id ? { ...item, isFavorite: nextIsFavorite } : item,
      ),
    );
    setErrorMessage(null);

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
      setEvents((prev) =>
        prev.map((item) =>
          item.id === event.id ? { ...item, isFavorite: currentEvent.isFavorite } : item,
        ),
      );
      setErrorMessage("관심행사 상태를 변경하지 못했습니다.");
    } finally {
      pendingFavoriteIdsRef.current.delete(event.id);
    }
  };

  if (!enabled) {
    return {
      events: [],
      isLoading: false,
      errorMessage: null,
      toggleFavorite,
    };
  }

  return {
    events,
    isLoading,
    errorMessage,
    toggleFavorite,
  };
}
