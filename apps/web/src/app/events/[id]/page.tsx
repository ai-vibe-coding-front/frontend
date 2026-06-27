'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import { CategoryBadge, type Category } from '@/components/common/CategoryBadge';
import MapPinIcon from '@/components/common/MapPinIcon';
import { useEventDetail } from '@/features/event-detail/hooks/useEventDetail';
import { KakaoMap, KakaoMapFallback } from '@/features/event-detail/components/KakaoMap';
import { LoginGuardModal } from '@/features/event-detail/components/LoginGuardModal';
import { FavoriteButton } from '@/features/event-detail/components/FavoriteButton';
import { ApiClientError } from '@/lib/api-client';
import { ROUTES } from '@/constants/routes';

const infoLabelClass = 'font-medium text-[15px] text-[#8c6e63] leading-[24px] w-[72px] shrink-0';
const infoValueClass = 'font-normal text-[15px] text-[#3f2a24] leading-[24px]';

function calcDday(endDate: string): string | null {
  const end = new Date(endDate);
  if (isNaN(end.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return '종료';
  if (diff === 0) return 'D-DAY';
  return `D-${diff}`;
}

function SkeletonLoader() {
  return (
    <div className="flex-1 flex flex-col px-6 pt-3 pb-6 gap-4 overflow-y-auto animate-pulse">
      <div className="rounded-[26px] h-[298.5px] w-full bg-[#d9cfc5] shrink-0" />
      <div className="inline-flex">
        <div className="h-[26px] w-[52px] bg-[#d9cfc5] rounded-full" />
      </div>
      <div className="flex flex-col gap-[6px]">
        <div className="h-[30px] w-3/4 bg-[#d9cfc5] rounded-[8px]" />
      </div>
      <div className="bg-[#fefefe] border border-[#ded0be] rounded-[22px] shadow-[0px_2px_8px_0px_rgba(63,42,36,0.06)]">
        <div className="flex flex-col px-[23px]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center py-[15px] border-b border-[#ded0be] gap-4">
              <div className="h-[16px] w-[28px] bg-[#d9cfc5] rounded-[4px] shrink-0" />
              <div className="h-[16px] w-2/3 bg-[#d9cfc5] rounded-[4px]" />
            </div>
          ))}
          <div className="flex flex-col py-[15px] gap-[10px]">
            <div className="h-[14px] w-[40px] bg-[#d9cfc5] rounded-[4px]" />
            <div className="flex flex-col gap-[6px]">
              <div className="h-[14px] w-full bg-[#d9cfc5] rounded-[4px]" />
              <div className="h-[14px] w-5/6 bg-[#d9cfc5] rounded-[4px]" />
              <div className="h-[14px] w-4/6 bg-[#d9cfc5] rounded-[4px]" />
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-[20px] h-[298.5px] w-full bg-[#d9cfc5] shrink-0" />
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

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
            <Link href="/" className="absolute inset-0 flex items-center justify-center font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">MUUD</Link>
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

  const handleExternalLink = () => {
    if (!event.bookingUrl) return;
    window.open(event.bookingUrl, '_blank', 'noopener,noreferrer');
  };

  const showImage = Boolean(event.imageUrl) && !imageFailed;

  const period =
    event.startDate && event.endDate
      ? `${event.startDate} — ${event.endDate}`
      : event.startDate ?? event.endDate ?? '-';

  return (
    <div className="bg-[#f0ebe3] h-screen flex items-center justify-center">
      <div className="bg-[rgba(251,249,244,0.95)] w-[390px] h-screen shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)] flex flex-col">

        {/* TopAppBar */}
        <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] relative flex items-center px-6 shrink-0">
          <Link href="/" className="size-4 shrink-0">
            <Image src="/icons/back-arrow.svg" alt="뒤로가기" width={16} height={16} className="size-full" />
          </Link>
          <Link href="/" className="absolute inset-0 flex items-center justify-center font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">
            MUUD
          </Link>
          <FavoriteButton
            eventItemId={event.eventItemId}
            initialFavorited={event.isFavorited}
            onAuthRequired={() => setShowLoginModal(true)}
          />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 flex flex-col px-6 pt-3 pb-6 gap-4 overflow-y-auto">

          {/* 메인 이미지 */}
          <div className="relative rounded-[26px] shadow-[0px_4px_20px_0px_rgba(63,42,36,0.06)] overflow-hidden h-[298.5px] w-full shrink-0">
            {showImage ? (
              <Image src={event.imageUrl as string} alt={event.title} fill sizes="390px" className="object-cover" onError={() => setImageFailed(true)} />
            ) : (
              <div className="w-full h-full bg-[#d9cfc5]" aria-hidden="true" />
            )}
          </div>

          {/* 카테고리 */}
          {event.realmName && (
            <div className="flex items-center">
              <CategoryBadge category={event.realmName as Category} size="large" />
            </div>
          )}

          {/* 제목 */}
          <div className="flex flex-col gap-[6px]">
            <p className="font-bold text-[22px] text-[#3f2a24] leading-[30.8px] tracking-[-0.88px]">
              {event.title}
            </p>
            {event.endDate && (() => {
              const dday = calcDday(event.endDate);
              return dday ? (
                <span className={`self-start text-[12px] font-medium leading-[18px] px-[10px] py-[3px] rounded-full ${dday === '종료' ? 'bg-[#e8e4de] text-[#8c6e63]' : 'bg-[#8edfd2] text-[#245b6b]'}`}>
                  {dday}
                </span>
              ) : null;
            })()}
          </div>

          {/* 정보 카드 */}
          <div className="bg-[#fefefe] border border-[#ded0be] rounded-[22px] shadow-[0px_2px_8px_0px_rgba(63,42,36,0.06)]">
            <div className="flex flex-col px-[23px]">
              <div className="flex items-center py-[15px] border-b border-[#ded0be]">
                <span className={infoLabelClass}>기간</span>
                <span className={infoValueClass}>{period}</span>
              </div>
              <div className="flex items-center py-[15px] border-b border-[#ded0be]">
                <span className={infoLabelClass}>장소</span>
                <span className={infoValueClass}>{event.place ?? '-'}</span>
              </div>
              <div className="flex items-center py-[15px] border-b border-[#ded0be]">
                <span className={infoLabelClass}>관람료</span>
                <span className={infoValueClass}>{event.price ?? '-'}</span>
              </div>
              <div className="flex flex-col py-[15px] gap-[10px]">
                <p className="font-medium text-[13px] text-[#8c6e63] leading-[19.5px]">행사정보</p>
                <p className="font-normal text-[14px] text-[#3f2a24] leading-[23.8px] opacity-80">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* 지도 섹션 */}
          {event.lat !== null && event.lng !== null ? (
            <KakaoMap latitude={event.lat} longitude={event.lng} venueName={event.place ?? ''} />
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
              disabled={!event.bookingUrl?.trim()}
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
        <LoginGuardModal redirectPath={ROUTES.eventDetail(id)} onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}
