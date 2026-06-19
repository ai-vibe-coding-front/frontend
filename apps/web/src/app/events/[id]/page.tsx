'use client';

import { useState } from 'react';
import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import MapPinIcon from '@/components/common/MapPinIcon';
import { useEventDetail } from '@/features/event-detail/hooks/useEventDetail';
import { KakaoMap, KakaoMapFallback } from '@/features/event-detail/components/KakaoMap';
import { LoginGuardModal } from '@/features/event-detail/components/LoginGuardModal';
import { ApiClientError } from '@/lib/api-client';

const infoLabelClass = 'font-medium text-[15px] text-[#8c6e63] leading-[24px] w-[72px] shrink-0';
const infoValueClass = 'font-normal text-[15px] text-[#3f2a24] leading-[24px]';

function HeartButton({ liked, onToggle }: { liked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`absolute right-[13px] top-[3.33px] border-[1.5px] border-[#ded0be] rounded-[16px] flex items-center justify-center size-[43px] ${liked ? 'bg-[#f0e4d4]' : 'bg-[#fefefe]'}`}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 17S3 12.5 3 7.5A4 4 0 0 1 10 5a4 4 0 0 1 7 2.5C17 12.5 10 17 10 17Z"
          fill={liked ? '#7d543c' : 'none'}
          stroke={liked ? '#7d543c' : '#8c6e63'}
          strokeWidth="1.5"
        />
      </svg>
    </button>
  );
}

function SkeletonLoader() {
  return (
    <div className="flex-1 flex flex-col px-6 pt-3 pb-6 gap-4 overflow-y-auto animate-pulse">
      <div className="rounded-[26px] h-[298.5px] w-full bg-[#d9cfc5] shrink-0" />
      <div className="h-[24px] w-[60px] bg-[#d9cfc5] rounded-full" />
      <div className="h-[30px] w-3/4 bg-[#d9cfc5] rounded-[8px]" />
      <div className="bg-[#fefefe] border border-[#ded0be] rounded-[22px] h-[200px]" />
      <div className="rounded-[20px] h-[298.5px] w-full bg-[#d9cfc5] shrink-0" />
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [liked, setLiked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: event, isPending, error } = useEventDetail(id);

  if (!id) notFound();

  if (isPending) {
    return (
      <div className="bg-[#f0ebe3] h-screen flex items-center justify-center">
        <div className="bg-[rgba(251,249,244,0.95)] w-[390px] h-screen shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)] flex flex-col">
          <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] relative flex items-center px-6 shrink-0">
            <Link href="/" className="size-4 shrink-0">
              <Image src="/icons/back-arrow.svg" alt="뒤로가기" width={16} height={16} className="size-full" />
            </Link>
            <p className="absolute inset-0 flex items-center justify-center font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">MUUD</p>
          </div>
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (error) {
    if (error instanceof ApiClientError && error.status === 404) notFound();
    return (
      <div className="bg-[#f0ebe3] h-screen flex items-center justify-center">
        <div className="bg-[rgba(251,249,244,0.95)] w-[390px] h-screen shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)] flex flex-col items-center justify-center gap-3 px-6">
          <MapPinIcon className="size-10 opacity-40" />
          <p className="font-medium text-[15px] text-[#6b6763] text-center">
            행사 정보를 불러올 수 없습니다
          </p>
          <Link href="/" className="font-bold text-[14px] text-[#245b6b]">홈으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

  const handleHeartClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setLiked((prev) => !prev);
  };

  const handleExternalLink = () => {
    if (!event.externalUrl) return;
    window.open(event.externalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-[#f0ebe3] h-screen flex items-center justify-center">
      <div className="bg-[rgba(251,249,244,0.95)] w-[390px] h-screen shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)] flex flex-col">

        {/* TopAppBar */}
        <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] relative flex items-center px-6 shrink-0">
          <Link href="/" className="size-4 shrink-0">
            <img src="/icons/back-arrow.svg" alt="뒤로가기" className="size-full" />
          </Link>
          <p className="absolute inset-0 flex items-center justify-center font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">
            MUUD
          </p>
          <HeartButton liked={liked} onToggle={handleHeartClick} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 flex flex-col px-6 pt-3 pb-6 gap-4 overflow-y-auto">

          {/* 메인 이미지 */}
          <div className="rounded-[26px] shadow-[0px_4px_20px_0px_rgba(63,42,36,0.06)] overflow-hidden h-[298.5px] w-full shrink-0">
            {event.imageUrl ? (
              <Image src={event.imageUrl!} alt={event.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-[#d9cfc5]" />
            )}
          </div>

          {/* 카테고리 */}
          <div className="flex items-center">
            <CategoryBadge category={event.category as React.ComponentProps<typeof CategoryBadge>['category']} size="large" />
          </div>

          {/* 제목 */}
          <p className="font-bold text-[22px] text-[#3f2a24] leading-[30.8px] tracking-[-0.88px]">
            {event.title}
          </p>

          {/* 정보 카드 */}
          <div className="bg-[#fefefe] border border-[#ded0be] rounded-[22px] shadow-[0px_2px_8px_0px_rgba(63,42,36,0.06)]">
            <div className="flex flex-col px-[23px]">
              <div className="flex items-center py-[15px] border-b border-[#ded0be]">
                <span className={infoLabelClass}>기간</span>
                <span className={infoValueClass}>{event.period}</span>
              </div>
              <div className="flex items-center py-[15px] border-b border-[#ded0be]">
                <span className={infoLabelClass}>장소</span>
                <span className={infoValueClass}>{event.venue}</span>
              </div>
              <div className="flex items-center py-[15px] border-b border-[#ded0be]">
                <span className={infoLabelClass}>관람료</span>
                <span className={infoValueClass}>{event.fee}</span>
              </div>
              <div className="flex flex-col py-[15px] gap-[10px]">
                <p className="font-bold text-[13px] text-[#8c6e63] leading-[19.5px]">행사정보</p>
                <p className="font-normal text-[14px] text-[#3f2a24] leading-[23.8px] opacity-80">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* 지도 섹션 */}
          {event.latitude && event.longitude ? (
            <KakaoMap latitude={event.latitude} longitude={event.longitude} venueName={event.venue} />
          ) : (
            <KakaoMapFallback />
          )}
        </div>

        {/* Footer CTA */}
        <div className="bg-[rgba(251,249,244,0.95)] border-t border-[rgba(222,208,190,0.2)] shrink-0">
          <div className="px-6 pt-[25px] pb-6">
            <button
              type="button"
              onClick={handleExternalLink}
              disabled={!event.externalUrl}
              className="bg-[#8edfd2] shadow-[0px_10px_12px_rgba(59,38,20,0.1)] w-full h-[48px] rounded-[16px] flex items-center justify-center gap-[10px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="font-bold text-[16px] text-[#245b6b] tracking-[-0.32px] leading-[24px]">
                예매 페이지로
              </span>
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1 8L8 1M8 1H3M8 1V6" stroke="#245b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <LoginGuardModal eventId={id} onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}
