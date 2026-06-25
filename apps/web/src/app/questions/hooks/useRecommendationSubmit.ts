'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { Answers } from '../questions';

type SubmitVariables = {
  answers: Answers;
  location: {
    lat?: number;
    lng?: number;
    nx?: number;
    ny?: number;
    sido?: string;
    address?: string;
    stationName?: string;
  };
};

export function useRecommendationSubmit() {
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ answers, location }: SubmitVariables) => {
      const session = await apiClient<{ explorationSessionId: string }>('/api/exploration-sessions', {
        method: 'POST',
        body: JSON.stringify({ location }),
      });
      return apiClient<{ runId: string }>('/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: session.explorationSessionId,
          answers: [
            { questionKey: 'q1', answerValue: answers.q1 },
            { questionKey: 'q2', answerValue: answers.q2 },
            { questionKey: 'q3', answerValue: answers.q3 },
            { questionKey: 'q4', answerValue: answers.q4 },
          ],
        }),
      });
    },
    onSuccess: ({ runId }) => router.push(`/recommendations/${runId}`),
  });
}
