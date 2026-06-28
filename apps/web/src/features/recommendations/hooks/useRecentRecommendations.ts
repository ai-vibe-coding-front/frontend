"use client";

import { useCallback, useMemo, useState } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EventCardData } from "@/components/common/EventCard";
import { RECENT_RECOMMENDATIONS_LIMIT } from "@/features/recommendations/constants";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { CurrentUser } from "@/features/users/hooks/useCurrentUser";

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

type FavoriteMutationResult = {
  eventItemId: string;
  isFavorited: boolean;
  favoriteCount: number;
};

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

function setRecentFavorite(
  data: RecentRecommendationsResponse | undefined,
  eventItemId: string,
  isFavorited: boolean,
): RecentRecommendationsResponse | undefined {
  if (!data) return data;

  return {
    ...data,
    items: data.items.map((item) =>
      item.eventItemId === eventItemId ? { ...item, isFavorited } : item,
    ),
  };
}

function removeFavoriteFromPages(
  data: InfiniteData<FavoritesResponse> | undefined,
  eventItemId: string,
): InfiniteData<FavoritesResponse> | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((item) => item.eventItemId !== eventItemId),
      pagination: {
        ...page.pagination,
        total: Math.max(0, page.pagination.total - 1),
      },
    })),
  };
}

function setUserFavoriteCount(user: CurrentUser | undefined, favoriteCount: number) {
  return user ? { ...user, favoriteCount } : user;
}

export function useRecentRecommendations(enabled: boolean): UseRecentRecommendationsResult {
  const queryClient = useQueryClient();
  const recentQueryKey = queryKeys.recommendations.recent(RECENT_RECOMMENDATIONS_LIMIT);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingFavoriteIds, setPendingFavoriteIds] = useState<Set<string>>(() => new Set());

  const query = useQuery({
    queryKey: recentQueryKey,
    queryFn: () =>
      apiClient<RecentRecommendationsResponse>(
        `/api/recommendations/recent?limit=${RECENT_RECOMMENDATIONS_LIMIT}`,
      ),
    enabled,
    select: (data) => data.items.map(toEventCardData),
  });

  const { mutateAsync: toggleFavoriteMutation } = useMutation({
    mutationFn: ({
      event,
      nextIsFavorite,
    }: {
      event: RecentRecommendationCard;
      nextIsFavorite: boolean;
    }) => {
      if (nextIsFavorite) {
        return apiClient<FavoriteMutationResult>("/api/favorites", {
          method: "POST",
          body: JSON.stringify({
            eventItemId: event.id,
            recommendationRunId: event.recommendationRunId ?? undefined,
          }),
        });
      }

      return apiClient<FavoriteMutationResult>(`/api/favorites/${event.id}`, {
        method: "DELETE",
      });
    },
    onMutate: async ({ event, nextIsFavorite }) => {
      setPendingFavoriteIds((current) => new Set(current).add(event.id));
      setErrorMessage(null);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: recentQueryKey }),
        queryClient.cancelQueries({ queryKey: queryKeys.favorites.list() }),
        queryClient.cancelQueries({ queryKey: queryKeys.users.me() }),
      ]);

      const previousRecent =
        queryClient.getQueryData<RecentRecommendationsResponse>(recentQueryKey);
      const previousFavorites =
        queryClient.getQueryData<InfiniteData<FavoritesResponse>>(queryKeys.favorites.list());
      const previousUser = queryClient.getQueryData<CurrentUser>(queryKeys.users.me());

      queryClient.setQueryData<RecentRecommendationsResponse>(
        recentQueryKey,
        (current) => setRecentFavorite(current, event.id, nextIsFavorite),
      );

      if (!nextIsFavorite) {
        queryClient.setQueryData<InfiniteData<FavoritesResponse>>(
          queryKeys.favorites.list(),
          (current) => removeFavoriteFromPages(current, event.id),
        );
      }

      if (previousUser) {
        queryClient.setQueryData<CurrentUser>(queryKeys.users.me(), {
          ...previousUser,
          favoriteCount: Math.max(
            0,
            previousUser.favoriteCount + (nextIsFavorite ? 1 : -1),
          ),
        });
      }

      return { previousRecent, previousFavorites, previousUser };
    },
    onSuccess: (data, { event, nextIsFavorite }) => {
      queryClient.setQueryData<RecentRecommendationsResponse>(
        recentQueryKey,
        (current) => setRecentFavorite(current, event.id, data.isFavorited),
      );
      queryClient.setQueryData<CurrentUser>(queryKeys.users.me(), (current) =>
        setUserFavoriteCount(current, data.favoriteCount),
      );

      if (nextIsFavorite) {
        queryClient.invalidateQueries({ queryKey: queryKeys.favorites.list() });
      } else {
        queryClient.setQueryData<InfiniteData<FavoritesResponse>>(
          queryKeys.favorites.list(),
          (current) => removeFavoriteFromPages(current, event.id),
        );
      }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousRecent) {
        queryClient.setQueryData(recentQueryKey, context.previousRecent);
      }
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites.list(), context.previousFavorites);
      }
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.me(), context.previousUser);
      }
      setErrorMessage("관심행사 상태를 변경하지 못했습니다.");
    },
    onSettled: (_data, _error, { event }) => {
      setPendingFavoriteIds((current) => {
        const next = new Set(current);
        next.delete(event.id);
        return next;
      });
    },
  });

  const events = useMemo(() => query.data ?? [], [query.data]);

  const toggleFavorite = useCallback(
    async (event: EventCardData) => {
      if (!enabled || pendingFavoriteIds.has(event.id)) return;

      const currentEvent = events.find((item) => item.id === event.id);
      if (!currentEvent) return;

      try {
        await toggleFavoriteMutation({
          event: currentEvent,
          nextIsFavorite: !currentEvent.isFavorite,
        });
      } catch {
        // onError에서 캐시 롤백과 메시지 설정을 처리한다.
      }
    },
    [enabled, events, pendingFavoriteIds, toggleFavoriteMutation],
  );

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
    isLoading: query.isPending,
    errorMessage:
      errorMessage ??
      (query.isError ? "최근 추천 결과를 불러오지 못했습니다." : null),
    toggleFavorite,
  };
}
