'use client';

import { useState } from 'react';
import { apiClient, ApiClientError } from '@/lib/api-client';

type Props = {
  eventItemId: string;
  initialFavorited: boolean;
  onAuthRequired: () => void;
};

export function FavoriteButton({ eventItemId, initialFavorited, onAuthRequired }: Props) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleToggle = async () => {
    const isLoggedIn =
      typeof document !== 'undefined' &&
      document.cookie.split(';').some((c) => c.trim().startsWith('isLoggedIn='));

    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }

    if (isPending) return;

    const prev = isFavorited;
    setIsFavorited(!prev);
    setErrorMessage(null);
    setIsPending(true);

    try {
      if (prev) {
        await apiClient(`/api/favorites/${eventItemId}`, { method: 'DELETE' });
      } else {
        await apiClient('/api/favorites', {
          method: 'POST',
          body: JSON.stringify({ eventItemId }),
        });
      }
    } catch (err) {
      setIsFavorited(prev);
      if (err instanceof ApiClientError && err.status === 401) {
        onAuthRequired();
        return;
      }
      setErrorMessage('잠시 후 다시 시도해주세요.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={isFavorited ? '관심 행사 해제' : '관심 행사 저장'}
        className={`absolute right-[13px] top-[3.33px] border-[1.5px] border-[#ded0be] rounded-[16px] flex items-center justify-center size-[43px] disabled:opacity-50 ${isFavorited ? 'bg-[#f0e4d4]' : 'bg-[#fefefe]'}`}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 17S3 12.5 3 7.5A4 4 0 0 1 10 5a4 4 0 0 1 7 2.5C17 12.5 10 17 10 17Z"
            fill={isFavorited ? '#7d543c' : 'none'}
            stroke={isFavorited ? '#7d543c' : '#8c6e63'}
            strokeWidth="1.5"
          />
        </svg>
      </button>
      {errorMessage && (
        <p
          role="alert"
          className="absolute right-[13px] top-[52px] text-[11px] text-[#c0392b] bg-[#fefefe] border border-[#ded0be] rounded-[8px] px-2 py-1 whitespace-nowrap shadow-sm z-10"
        >
          {errorMessage}
        </p>
      )}
    </>
  );
}
