"use client";

import { useCallback, useMemo, useState } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { EventCardData } from "@/components/common/EventCard";
import { RECENT_RECOMMENDATIONS_LIMIT } from "@/features/recommendations/constants";
import type { CurrentUser } from "@/features/users/hooks/useCurrentUser";
import { ApiClientError, apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

const FAVORITES_PAGE_LIMIT = 20;

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

type FavoriteMutationResult = {
  eventItemId: string;
  isFavorited: boolean;
  favoriteCount: number;
};

type RecentRecommendationItem = {
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
};

type RecentRecommendationsResponse = {
  runId: string | null;
  curation: string | null;
  items: RecentRecommendationItem[];
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

function setUserFavoriteCount(user: CurrentUser | undefined, favoriteCount: number) {
  return user ? { ...user, favoriteCount } : user;
}

async function fetchFavoritesPage(page: number) {
  return apiClient<FavoritesResponse>(
    `/api/favorites?page=${page}&limit=${FAVORITES_PAGE_LIMIT}`,
  );
}

export function useFavoriteEvents() {
  const queryClient = useQueryClient();
  const [mutationErrorMessage, setMutationErrorMessage] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const recentQueryKey = queryKeys.recommendations.recent(RECENT_RECOMMENDATIONS_LIMIT);

  const query = useInfiniteQuery({
    queryKey: queryKeys.favorites.list(),
    queryFn: ({ pageParam }) => fetchFavoritesPage(Number(pageParam)),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
  });

  const { error: mutationError, mutateAsync: removeFavoriteMutation } = useMutation({
    mutationFn: (eventItemId: string) =>
      apiClient<FavoriteMutationResult>(`/api/favorites/${eventItemId}`, {
        method: "DELETE",
      }),
    onMutate: async (eventItemId) => {
      setPendingIds((current) => new Set(current).add(eventItemId));
      setMutationErrorMessage(null);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.favorites.list() }),
        queryClient.cancelQueries({ queryKey: recentQueryKey }),
        queryClient.cancelQueries({ queryKey: queryKeys.users.me() }),
      ]);

      const previousFavorites =
        queryClient.getQueryData<InfiniteData<FavoritesResponse>>(queryKeys.favorites.list());
      const previousRecent =
        queryClient.getQueryData<RecentRecommendationsResponse>(recentQueryKey);
      const previousUser = queryClient.getQueryData<CurrentUser>(queryKeys.users.me());

      queryClient.setQueryData<InfiniteData<FavoritesResponse>>(
        queryKeys.favorites.list(),
        (current) => removeFavoriteFromPages(current, eventItemId),
      );
      queryClient.setQueryData<RecentRecommendationsResponse>(
        recentQueryKey,
        (current) => setRecentFavorite(current, eventItemId, false),
      );
      if (previousUser) {
        queryClient.setQueryData<CurrentUser>(queryKeys.users.me(), {
          ...previousUser,
          favoriteCount: Math.max(0, previousUser.favoriteCount - 1),
        });
      }

      return { previousFavorites, previousRecent, previousUser };
    },
    onSuccess: (data, eventItemId) => {
      queryClient.setQueryData<InfiniteData<FavoritesResponse>>(
        queryKeys.favorites.list(),
        (current) => removeFavoriteFromPages(current, eventItemId),
      );
      queryClient.setQueryData<RecentRecommendationsResponse>(
        recentQueryKey,
        (current) => setRecentFavorite(current, eventItemId, data.isFavorited),
      );
      queryClient.setQueryData<CurrentUser>(queryKeys.users.me(), (current) =>
        setUserFavoriteCount(current, data.favoriteCount),
      );
    },
    onError: (error, _eventItemId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites.list(), context.previousFavorites);
      }
      if (context?.previousRecent) {
        queryClient.setQueryData(recentQueryKey, context.previousRecent);
      }
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.me(), context.previousUser);
      }

      if (!(error instanceof ApiClientError && error.status === 401)) {
        setMutationErrorMessage("관심행사 해제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    },
    onSettled: (_data, _error, eventItemId) => {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(eventItemId);
        return next;
      });
    },
  });

  const events = useMemo(
    () => query.data?.pages.flatMap((page) => page.items.map(toEventCardData)) ?? [],
    [query.data],
  );

  const {
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    isPending,
  } = query;

  const loadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    setMutationErrorMessage(null);
    try {
      await fetchNextPage();
    } catch {
      // query 상태의 에러 메시지로 렌더링한다.
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const removeFavorite = useCallback(
    async (eventItemId: string) => {
      if (pendingIds.has(eventItemId)) return;
      try {
        await removeFavoriteMutation(eventItemId);
      } catch {
        // onError에서 캐시 롤백과 메시지 설정을 처리한다.
      }
    },
    [pendingIds, removeFavoriteMutation],
  );

  const error = queryError ?? mutationError;
  const isUnauthorized = error instanceof ApiClientError && error.status === 401;
  const queryErrorMessage =
    isError && events.length === 0
      ? "관심행사 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
      : isFetchNextPageError
        ? "관심행사 목록을 더 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
        : null;

  return {
    events,
    isLoading: isPending,
    isLoadingMore: isFetchingNextPage,
    hasNext: hasNextPage,
    errorMessage: mutationErrorMessage ?? queryErrorMessage,
    isUnauthorized,
    pendingIds,
    loadMore,
    removeFavorite,
  };
}
