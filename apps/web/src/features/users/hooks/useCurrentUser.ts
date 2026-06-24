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
      setUser(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let ignore = false;

    setIsLoading(true);
    setError(null);

    apiClient<CurrentUser>("/api/users/me")
      .then((currentUser) => {
        if (ignore) return;
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

  return {
    user,
    isLoading,
    error,
    isUnauthorized: error instanceof ApiClientError && error.status === 401,
  };
}
