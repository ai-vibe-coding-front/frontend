"use client";

import { useEffect, useState } from "react";
import type { EventCardData } from "@/components/common/EventCard";
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingFavoriteIds, setPendingFavoriteIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!enabled) {
      setEvents([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    let ignore = false;

    setIsLoading(true);
    setErrorMessage(null);

    apiClient<RecentRecommendationsResponse>("/api/recommendations/recent")
      .then((data) => {
        if (ignore) return;
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
    if (pendingFavoriteIds.has(event.id)) return;

    const currentEvent = events.find((item) => item.id === event.id);
    if (!currentEvent) return;

    const nextIsFavorite = !currentEvent.isFavorite;

    setPendingFavoriteIds((prev) => new Set(prev).add(event.id));
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
      setPendingFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(event.id);
        return next;
      });
    }
  };

  return {
    events,
    isLoading,
    errorMessage,
    toggleFavorite,
  };
}
