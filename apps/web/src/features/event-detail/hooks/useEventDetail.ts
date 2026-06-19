import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiClientError } from '@/lib/api-client';
import type { EventDetail } from '../types';

async function fetchEventDetail(id: string): Promise<EventDetail> {
  return apiClient<EventDetail>(`/api/events/${id}`);
}

export function useEventDetail(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEventDetail(id),
    enabled: !!id,
    retry: (failureCount, error) => {
      if (error instanceof ApiClientError && error.status === 404) return false;
      return failureCount < 2;
    },
  });
}
