'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter, notFound } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { CTAButton } from '@/components/common/CTAButton';
import { WeatherCard } from '@/features/recommendations/WeatherCard';
import { EventResultList } from '@/features/recommendations/EventResultList';
import { useRecommendationRun } from '@/features/recommendations/hooks/useRecommendationRun';
import type { EventCardData } from '@/components/common/EventCard';
import { ApiClientError } from '@/lib/api-client';

function SkeletonLoader() {
  return (
    <div className="flex-1 flex flex-col px-6 pt-3 pb-4 gap-6 overflow-y-auto animate-pulse">
      <div className="bg-[rgba(142,223,210,0.4)] rounded-[26px] shadow-[0px_4px_16px_0px_rgba(59,38,20,0.1)] w-full shrink-0">
        <div className="flex items-center gap-[14px] p-4 min-h-[96px]">
          <div className="bg-[rgba(59,130,120,0.18)] rounded-full size-16 shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="bg-[rgba(59,130,120,0.18)] rounded h-[14px] w-24" />
            <div className="bg-[rgba(59,130,120,0.18)] rounded h-[22px] w-40" />
            <div className="bg-[rgba(59,130,120,0.18)] rounded h-[14px] w-28" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-[30px] w-2/3 bg-[#d9cfc5] rounded-[8px]" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-[20px] w-full overflow-hidden shadow-[0px_4px_20px_0px_rgba(63,42,36,0.1)] shrink-0"
          >
            <div className="h-[192px] w-full bg-[#d9cfc5]" />
            <div className="flex flex-col gap-1.5 px-4 pt-3 pb-4">
              <div className="h-[22px] w-3/4 bg-[#d9cfc5] rounded-[6px]" />
              <div className="h-[18px] w-1/2 bg-[#e5ddd2] rounded-[6px]" />
              <div className="h-[17px] w-1/3 bg-[#e5ddd2] rounded-[6px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const params = useParams();
  const router = useRouter();
  const runId = typeof params.runId === 'string' ? params.runId : '';

  const { data: run, isPending, error } = useRecommendationRun(runId);

  if (!runId) notFound();

  if (isPending) {
    return (
      <div className="flex justify-center h-dvh bg-[#f0ebe3]">
        <div className="relative flex flex-col w-[390px] h-dvh bg-[rgba(251,249,244,0.95)] shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)]">
          <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] flex items-center px-6 relative shrink-0">
            <Link href="/" className="size-4 shrink-0">
              <Image src="/icons/back-arrow.svg" alt="뒤로가기" width={16} height={16} />
            </Link>
            <p className="absolute inset-0 flex items-center justify-center font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">
              오늘의 추천
            </p>
          </div>
          <SkeletonLoader />
          <div className="shrink-0">
            <BottomNav activeTab="recommend" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !run) {
    if (error instanceof ApiClientError && error.status === 404) notFound();
    return (
      <div className="flex justify-center h-dvh bg-[#f0ebe3]">
        <div className="relative flex flex-col items-center justify-center w-[390px] h-dvh bg-[#f9f4ec] shadow-[0px_16px_18px_0px_rgba(51,31,15,0.18)] px-6">

          {/* 일러스트 영역 */}
          <div className="relative flex items-center justify-center w-[220px] h-[180px]">
            <div className="absolute bg-[#e9dfd0] opacity-50 rounded-full size-[160px] top-[10px] left-[30px]" />
            <div className="absolute bg-[#dcd0c2] opacity-60 rounded-full size-[110px] top-[35px] left-[55px]" />
            <div className="absolute left-[88px] top-[61px] flex items-center justify-center w-[44px] h-[52px]">
              <Image src="/icons/not-found-illustration.svg" alt="" width={44} height={52} />
            </div>
            <div className="absolute bg-[#8edfd2] opacity-60 rounded-full size-[8px] top-[43px] left-[-25px]" />
            <div className="absolute bg-[#bf8b6e] opacity-50 rounded-full size-[5px] top-[73px] left-[228px]" />
            <div className="absolute bg-[#e4d8c9] rounded-full size-[6px] top-[13px] left-[249px]" />
          </div>

          {/* 텍스트 영역 */}
          <div className="flex flex-col items-center gap-[10px] pt-[8px]">
            <p className="font-bold text-[22px] text-[#251e19] leading-[32px] text-center">
              추천 결과를 불러올 수 없어요
            </p>
            <p className="font-medium text-[13px] text-[#716456] leading-[20px] text-center">
              잠시 후 다시 시도해주세요
            </p>
          </div>

          {/* ERROR 배지 */}
          <div className="mt-[8px] bg-[#f0e9df] rounded-full px-[12px] py-[4px]">
            <p className="font-bold text-[11px] text-[#7d543c] tracking-[0.5px]">ERROR</p>
          </div>

          {/* CTA 버튼 */}
          <div className="mt-[28px] w-full">
            <CTAButton label="홈으로 돌아가기" onClick={() => router.push('/')} />
          </div>
        </div>
      </div>
    );
  }

  const events: EventCardData[] = run.items.map((item) => ({
    id: item.eventItem.id,
    title: item.eventItem.title,
    realmName: item.eventItem.realmName,
    place: item.eventItem.place,
    startDate: item.eventItem.startDate ? new Date(item.eventItem.startDate) : null,
    endDate: item.eventItem.endDate ? new Date(item.eventItem.endDate) : null,
    imageUrl: item.eventItem.imageUrl,
    isFavorite: item.isFavorited,
  }));

  const hasResults = events.length > 0;
  const weather = run.weather;

  return (
    <div className="flex justify-center h-dvh bg-[#f0ebe3]">
      <div className="relative flex flex-col w-[390px] h-dvh bg-[rgba(251,249,244,0.95)] shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)]">

        {/* TopAppBar */}
        <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] flex items-center px-6 relative shrink-0">
          <Link href="/" className="size-4 shrink-0">
            <Image src="/icons/back-arrow.svg" alt="뒤로가기" width={16} height={16} />
          </Link>
          <p className="absolute inset-0 flex items-center justify-center font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">
            오늘의 추천
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col px-6 pt-3 pb-4 gap-6 overflow-y-auto">
          {weather && weather.temperature != null ? (
            <WeatherCard
              location="내 위치"
              weather={weather.type}
              temperature={weather.temperature}
              subtitle={run.curation ?? undefined}
            />
          ) : (
            <WeatherCard isError />
          )}

          <div className="flex flex-col gap-3">
            <p className="font-bold text-[20px] text-[#251e19] tracking-[-0.5px] leading-[30px]">
              오늘 당신에게 추천하는 공간
            </p>

            {hasResults ? (
              <EventResultList events={events} />
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
