import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { TodayMoodCard } from "@/features/recommendations/TodayMoodCard";
import { EventCarousel } from "@/features/recommendations/EventCarousel";
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
    category: "음악/콘서트",
    title: "서울 재즈 페스티벌 2026",
    venue: "올림픽공원 88잔디마당",
    period: "2026.05.23 – 2026.05.25",
    dDay: 5,
    liked: false,
  },
  {
    id: "3",
    category: "연극",
    title: "햄릿 — 국립극단",
    venue: "명동예술극장",
    period: "2026.06.10 – 2026.07.05",
    dDay: 28,
    liked: false,
  },
  {
    id: "4",
    category: "행사/축제",
    title: "한강 달빛 마켓",
    venue: "여의도 한강공원",
    period: "2026.06.14 – 2026.06.15",
    dDay: 3,
    liked: true,
  },
  {
    id: "5",
    category: "뮤지컬/오페라",
    title: "레미제라블",
    venue: "예술의전당 오페라극장",
    period: "2026.06.20 – 2026.08.31",
    dDay: 75,
    liked: false,
  },
  {
    id: "6",
    category: "무용/발레",
    title: "지젤 — 국립발레단",
    venue: "예술의전당 CJ토월극장",
    period: "2026.06.25 – 2026.06.29",
    dDay: 12,
    liked: false,
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const isLoggedIn = view !== "guest";

  return (
    <div className="flex justify-center h-screen bg-[#f0ebe3]">
      <div className="relative flex flex-col w-[390px] h-screen bg-[#f9f4ec] shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)]">

        {/* Header - sticky */}
        <header className="sticky top-0 z-10 bg-[#f9f4ec] px-6 pt-6 pb-3">
          <Header />
        </header>

        {/* 콘텐츠 - 스크롤 영역 */}
        <main className={`flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-4 ${!isLoggedIn ? "justify-center" : ""}`}>
          <TodayMoodCard
            isLoggedIn={isLoggedIn}
            userName="성우"
          />

          {isLoggedIn && (
            <div className="flex flex-col gap-3">
              <h2 className="font-bold text-base text-[#3f2a24] leading-6">
                최근 추천 결과
              </h2>
              <EventCarousel events={MOCK_EVENTS} />
            </div>
          )}
        </main>

        {/* BottomNav - flex로 맨 아래 */}
        <BottomNav activeTab="home" />
      </div>
    </div>
  );
}
