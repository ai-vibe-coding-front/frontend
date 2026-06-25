'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useExplorationSessionMe() {
  return useQuery({
    queryKey: ['explorationSessionMe'],
    queryFn: () => apiClient<{ hasUsed: boolean }>('/api/exploration-sessions/me'),
    staleTime: 0,
  });
}
