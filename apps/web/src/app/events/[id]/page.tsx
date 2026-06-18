'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import MapPinIcon from '@/components/common/MapPinIcon';

const MOCK_EVENT = {
  id: '1',
  category: '전시' as const,
  title: '서울시립미술관 기획전 — 고요의 형태',
  period: '05.20 — 07.31',
  venue: '서울시립미술관',
  fee: '무료',
  description:
    '본 전시는 일상의 소음에서 벗어나 고요 속에서 발견하는 내면의 목소리를 주제로 합니다. 국내외 작가 12인이 참여하여 다양한 형태의 미니멀리즘을 선보입니다.',
};

const infoLabelClass = 'font-medium text-[15px] text-[#8c6e63] leading-[24px] w-[72px] shrink-0';
const infoValueClass = 'font-normal text-[15px] text-[#3f2a24] leading-[24px]';

function HeartButton({ liked, onToggle }: { liked: boolean; onToggle: () => void }) {
  return (
    <button
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

export default function EventDetailPage() {
  const [liked, setLiked] = useState(false);
  const event = MOCK_EVENT;

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
          <HeartButton liked={liked} onToggle={() => setLiked(!liked)} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 flex flex-col px-6 pt-3 pb-6 gap-4 overflow-y-auto">

          {/* 메인 이미지 */}
          <div className="rounded-[26px] shadow-[0px_4px_20px_0px_rgba(63,42,36,0.06)] overflow-hidden h-[298.5px] w-full shrink-0">
            <div className="w-full h-full bg-[#d9cfc5]" />
          </div>

          {/* 카테고리 */}
          <div className="flex items-center">
            <CategoryBadge category={event.category} size="large" />
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
          <div className="border border-[#ded0be] rounded-[20px] shadow-[0px_2px_12px_0px_rgba(63,42,36,0.06)] overflow-hidden h-[298.5px] w-full shrink-0">
            <div className="w-full h-full bg-[#e8e0d5] flex items-center justify-center">
              <MapPinIcon className="size-8" />
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-[rgba(251,249,244,0.95)] border-t border-[rgba(222,208,190,0.2)] shrink-0">
          <div className="px-6 pt-[25px] pb-6">
            <button className="bg-[#8edfd2] shadow-[0px_10px_12px_rgba(59,38,20,0.1)] w-full h-[48px] rounded-[16px] flex items-center justify-center gap-[10px]">
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
    </div>
  );
}
