import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";
import { WeatherCard } from "@/features/recommendations/WeatherCard";
import { EventCard } from "@/components/common/EventCard";
import type { EventCardData } from "@/components/common/EventCard";

const MOCK_EVENTS: EventCardData[] = [
  {
    id: "1",
    category: "전시",
    title: "빛으로 쓴 편지 — 사진전",
    venue: "성수 갤러리아 포레",
    period: "2026.06.01 – 2026.06.30",
    dDay: 18,
    liked: true,
  },
  {
    id: "2",
    category: "전시",
    title: "빛으로 쓴 편지 — 사진전",
    venue: "성수 갤러리아 포레",
    period: "2026.06.01 – 2026.06.30",
    dDay: 18,
    liked: false,
  },
];

interface Props {
  searchParams: Promise<{ empty?: string }>;
}

export default async function RecommendationsPage({ searchParams }: Props) {
  const { empty } = await searchParams;
  const hasResults = empty !== "true";

  return (
    <div className="bg-[#f0ebe3] h-screen flex items-center justify-center">
      <div className="bg-[rgba(251,249,244,0.95)] w-[390px] h-screen shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)] flex flex-col">

        {/* TopAppBar */}
        <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] flex items-center px-6 relative shrink-0">
          <Link href="/" className="size-4 shrink-0">
            <img src="/icons/back-arrow.svg" alt="뒤로가기" className="size-full" />
          </Link>
          <p className="absolute inset-0 flex items-center justify-center font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">
            오늘의 추천
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col px-6 pt-3 pb-4 gap-6 overflow-y-auto">
          <WeatherCard />

          <div className="flex flex-col gap-3">
            <p className="font-bold text-[20px] text-[#251e19] tracking-[-0.5px] leading-[30px]">
              오늘 당신에게 추천하는 공간
            </p>

            {hasResults ? (
              <div className="flex flex-col gap-3">
                {MOCK_EVENTS.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="bg-[#fefefe] rounded-[18px] shadow-[0px_4px_10px_rgba(63,42,36,0.1)] flex flex-col items-center justify-center gap-4 py-[52px] px-6">
                <div className="bg-[#f5ede0] rounded-[12px] size-16 flex items-center justify-center">
                  <span className="text-[28px]">✨</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="font-bold text-[17px] text-[#251e19] tracking-[-0.4px] leading-[26px]">
                    추천 결과가 없어요
                  </p>
                  <p className="font-medium text-[13px] text-[#716456] leading-[20px]">
                    오늘의 무드를 알려주시면 맞춤 추천을 보여드릴게요
                  </p>
                </div>
                <div className="mt-1">
                  <Link
                    href="/questions"
                    className="bg-[#251e19] text-white font-bold text-[15px] tracking-[-0.3px] leading-[20px] px-7 py-[13px] rounded-full"
                  >
                    추천받기
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BottomNav */}
        <div className="shrink-0">
          <BottomNav activeTab="recommend" />
        </div>
      </div>
    </div>
  );
}
