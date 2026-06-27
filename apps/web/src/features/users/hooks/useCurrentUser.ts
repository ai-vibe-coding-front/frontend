"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiClientError, apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export interface CurrentUser {
  id: string;
  email: string;
  nickname: string;
  favoriteCount: number;
}

interface UseCurrentUserResult {
  user: CurrentUser | null;
  isLoading: boolean;
  error: Error | ApiClientError | null;
  isUnauthorized: boolean;
}

export function useCurrentUser(enabled = true): UseCurrentUserResult {
  const query = useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => apiClient<CurrentUser>("/api/users/me"),
    enabled,
    retry: (failureCount, error) => {
      if (error instanceof ApiClientError && error.status === 401) return false;
      return failureCount < 1;
    },
  });

  if (!enabled) {
    return {
      user: null,
      isLoading: false,
      error: null,
      isUnauthorized: false,
    };
  }

  const error =
    query.error instanceof Error
      ? query.error
      : query.error
        ? new Error("사용자 정보를 불러오지 못했습니다.")
        : null;

  return {
    user: error ? null : query.data ?? null,
    isLoading: query.isPending,
    error,
    isUnauthorized: error instanceof ApiClientError && error.status === 401,
  };
}
