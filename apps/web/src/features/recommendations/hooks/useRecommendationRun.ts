import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiClientError } from '@/lib/api-client';
import type { RecommendationRunDetail } from '../types';

async function fetchRecommendationRun(runId: string): Promise<RecommendationRunDetail> {
  return apiClient<RecommendationRunDetail>(`/api/recommendations/${runId}`);
}

export const recommendationRunKey = (runId: string) => ['recommendation-run', runId] as const;

export function useRecommendationRun(runId: string) {
  return useQuery({
    queryKey: recommendationRunKey(runId),
    queryFn: () => fetchRecommendationRun(runId),
    enabled: !!runId,
    staleTime: Infinity,
    retry: (failureCount, error) => {
      if (error instanceof ApiClientError && error.status === 404) return false;
      return failureCount < 2;
    },
  });
}
