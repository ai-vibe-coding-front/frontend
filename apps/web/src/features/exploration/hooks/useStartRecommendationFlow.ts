'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { apiClient } from '@/lib/api-client';

type ExplorationSessionMe = {
  hasUsed: boolean;
};

export function useStartRecommendationFlow() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  const closeLimitModal = useCallback(() => {
    setIsLimitModalOpen(false);
  }, []);

  const startRecommendationFlow = useCallback(async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      const { hasUsed } = await apiClient<ExplorationSessionMe>('/api/exploration-sessions/me');
      if (hasUsed) {
        setIsLimitModalOpen(true);
        return;
      }

      router.push(ROUTES.locationPermission);
    } catch (error) {
      console.error('[start recommendation flow]', error);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, router]);

  return {
    isChecking,
    isLimitModalOpen,
    closeLimitModal,
    startRecommendationFlow,
  };
}
