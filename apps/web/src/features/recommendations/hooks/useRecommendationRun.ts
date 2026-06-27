import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { RecommendationRunDetail } from '../types';

async function fetchRecommendationRun(runId: string): Promise<RecommendationRunDetail> {
  return apiClient<RecommendationRunDetail>(`/api/recommendations/${runId}`);
}

export function useRecommendationRun(runId: string) {
  return useQuery({
    queryKey: queryKeys.recommendations.detail(runId),
    queryFn: () => fetchRecommendationRun(runId),
    enabled: !!runId,
    staleTime: Infinity,
    retry: (failureCount, error) => {
      if (error instanceof ApiClientError && error.status === 404) return false;
      return failureCount < 2;
    },
  });
}
