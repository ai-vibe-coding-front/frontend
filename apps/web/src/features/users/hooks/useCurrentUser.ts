"use client";

import { useEffect, useState } from "react";
import { ApiClientError, apiClient } from "@/lib/api-client";

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
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | ApiClientError | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let ignore = false;

    apiClient<CurrentUser>("/api/users/me")
      .then((currentUser) => {
        if (ignore) return;
        setError(null);
        setUser(currentUser);
      })
      .catch((unknownError: unknown) => {
        if (ignore) return;

        setUser(null);
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("사용자 정보를 불러오지 못했습니다."),
        );
      })
      .finally(() => {
        if (ignore) return;
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [enabled]);

  if (!enabled) {
    return {
      user: null,
      isLoading: false,
      error: null,
      isUnauthorized: false,
    };
  }

  return {
    user,
    isLoading,
    error,
    isUnauthorized: error instanceof ApiClientError && error.status === 401,
  };
}
