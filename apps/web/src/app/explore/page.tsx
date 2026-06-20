import Link from 'next/link';
import { EventCard } from '@/components/common/EventCard';
import type { EventCardData } from '@/components/common/EventCard';
import MapPinIcon from '@/components/common/MapPinIcon';

const MOCK_EVENTS: EventCardData[] = [
  {
    id: '1',
    realmName: '전시',
    title: '빛으로 쓴 편지 — 사진전',
    place: '성수 갤러리아 포레',
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-30'),
    imageUrl: null,
    isFavorite: true,
  },
  {
    id: '2',
    realmName: '전시',
    title: '빛으로 쓴 편지 — 사진전',
    place: '성수 갤러리아 포레',
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-30'),
    imageUrl: null,
    isFavorite: false,
  },
];

export default function ExplorePage() {
  return (
    <div className="bg-[#f0ebe3] min-h-screen flex items-center justify-center">
      <div className="bg-[#e8e0d5] w-[390px] min-h-screen shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)] relative overflow-hidden flex flex-col">

        {/* TopAppBar */}
        <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] relative flex items-center px-6 shrink-0 z-10">
          <Link href="/" className="size-4 shrink-0">
            <img src="/icons/back-arrow.svg" alt="뒤로가기" className="size-full" />
          </Link>
          <p className="absolute inset-0 flex items-center justify-center font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">
            문화 생활지도
          </p>
        </div>

        {/* 지도 배경 (placeholder) */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-[#e8e0d5]">
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <MapPinIcon className="size-16" />
            </div>
          </div>
        </div>

        {/* 바텀 시트 */}
        <div className="absolute bottom-0 left-[-2px] w-[390px] h-[394px] bg-[rgba(251,249,244,0.97)] rounded-tl-[24px] rounded-tr-[24px] shadow-[0px_-4px_24px_0px_rgba(63,42,36,0.1)] z-10 flex flex-col overflow-hidden">

          {/* 핸들 */}
          <div className="flex justify-center pt-3 pb-1.5 shrink-0">
            <div className="bg-[#c9b5ae] h-1 w-10 rounded-full" />
          </div>

          {/* 헤더 */}
          <div className="flex items-end justify-between px-5 pt-1 pb-0 shrink-0">
            <p className="font-bold text-[20px] text-[#251e19] leading-[30px] tracking-[-0.5px]">
              내 주변 추천 5곳
            </p>
            <div className="flex items-center gap-1">
              <span className="font-normal text-[12px] text-[#6b6763] leading-[18px]">성동구</span>
              <span className="font-normal text-[12px] text-[#6b6763] leading-[18px]">2KM</span>
            </div>
          </div>

          {/* 카드 목록 */}
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-8 flex flex-col gap-3">
            {MOCK_EVENTS.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
