"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BottomNav } from "@/components/layout/BottomNav";
import { EventCard, type EventCardData } from "@/components/common/EventCard";
import { LocationPermissionModal } from "@/components/common/LocationPermissionModal";
import { KakaoMap } from "@/features/location/KakaoMap";
import {
  useNearbyEventsMap,
  NEARBY_EVENTS_RADIUS_KM,
  type CultureEvent,
} from "@/features/events/hooks/useNearbyEventsMap";

const DEFAULT_CENTER = { lat: 37.544581, lng: 127.055961 };

const CATEGORY_FILTERS: { label: string; value: string | null; color: string }[] = [
  { label: "전체", value: null, color: "#e5e5e5" },
  { label: "전시", value: "전시", color: "#8ecdf5" },
  { label: "음악/콘서트", value: "음악/콘서트", color: "#9fa7d1" },
  { label: "행사/축제", value: "행사/축제", color: "#9fd1b8" },
  { label: "연극", value: "연극", color: "#f5c18e" },
  { label: "뮤지컬/오페라", value: "뮤지컬/오페라", color: "#c18ef5" },
  { label: "국악", value: "국악", color: "#f5e18e" },
  { label: "무용/발레", value: "무용/발레", color: "#f58ec1" },
  { label: "아동/가족", value: "아동/가족", color: "#8ef5c1" },
  { label: "교육/체험", value: "교육/체험", color: "#f5a08e" },
  { label: "기타", value: "기타", color: "#e5e5e5" },
];

function toEventCardData(event: CultureEvent): EventCardData {
  return {
    id: event.eventItemId,
    title: event.title,
    realmName: event.realmName,
    place: event.address ?? event.place,
    startDate: event.startDate ? new Date(event.startDate) : null,
    endDate: event.endDate ? new Date(event.endDate) : null,
    imageUrl: event.imageUrl,
    isFavorite: event.isFavorited,
  };
}

function ExploreSkeleton() {
  return (
    <div className="absolute inset-0 z-20 bg-[#fbf9f4]">
      <div className="absolute inset-0 bg-[#d9cfc5]" />

      <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        <div className="size-[48px] rounded-[12px] bg-[#c7bdb3]" />
        <div className="size-[48px] rounded-[12px] bg-[#c7bdb3]" />
        <div className="size-[48px] rounded-[12px] bg-[#c7bdb3]" />
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 p-4 w-full">
        <div className="bg-[#fefefe] rounded-[32px] p-[25px] flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="h-[12px] w-1/3 bg-[#d9cfc5] rounded-[4px]" />
            <div className="h-[20px] w-2/3 bg-[#d9cfc5] rounded-[4px]" />
          </div>
          <div className="h-[14px] w-3/4 bg-[#d9cfc5] rounded-[4px]" />
          <div className="h-[48px] w-full bg-[#d9cfc5] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const router = useRouter();
  const {
    hasGpsLocation,
    isLoadingEvents,
    cultureEvents,
    isEventsExpanded,
    setIsEventsExpanded,
    isMapReady,
    isMapError,
    selectedCategory,
    districtName,
    mapScaleMeters,
    onMapReady,
    onMapError,
    handleGpsClick,
    handleCategorySelect,
    handleZoomIn,
    handleZoomOut,
    handleToggleFavorite,
  } = useNearbyEventsMap({ persistLocation: true });
  const [isLocationPromptDismissed, setIsLocationPromptDismissed] = useState(false);

  return (
    <div className="bg-[#f0ebe3] min-h-screen flex items-center justify-center">
      <div className="bg-[#fbf9f4] w-[390px] min-h-screen shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)] flex flex-col relative overflow-hidden">
        {/* TopAppBar */}
        <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] flex items-center px-6 relative shrink-0 z-10">
          <button
            onClick={() => router.back()}
            className="size-[16px] shrink-0"
          >
            <Image
              src="/icons/back-arrow.svg"
              alt="뒤로가기"
              width={16}
              height={16}
              className="size-full"
            />
          </button>
          <p className="absolute inset-0 flex items-center justify-center font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px] pointer-events-none">
            문화 생활지도
          </p>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 relative">
          {/* 지도 배경 */}
          <KakaoMap
            center={DEFAULT_CENTER}
            className="absolute inset-0"
            onMapReady={onMapReady}
            onError={onMapError}
          />
          {!isMapReady && !isMapError && <ExploreSkeleton />}
          {!hasGpsLocation && !isLocationPromptDismissed && (
            <LocationPermissionModal
              onAllow={handleGpsClick}
              onSkip={() => setIsLocationPromptDismissed(true)}
            />
          )}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(251,249,244,0.4) 0%, rgba(251,249,244,0) 20%, rgba(251,249,244,0) 80%, rgba(251,249,244,0.4) 100%)",
            }}
          />

          {/* 카테고리 필터 */}
          {hasGpsLocation && (
            <div className="absolute top-3 left-0 right-0 z-10 px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 w-max">
                {CATEGORY_FILTERS.map((filter) => {
                  const isSelected = selectedCategory === filter.value;
                  return (
                    <button
                      key={filter.label}
                      type="button"
                      onClick={() => handleCategorySelect(filter.value)}
                      className={`px-3 py-[6px] rounded-full text-[13px] font-medium whitespace-nowrap border transition-all ${
                        isSelected
                          ? "border-transparent text-[#3f2a24]"
                          : "border-[rgba(207,196,189,0.4)] bg-white text-[#6b6763]"
                      }`}
                      style={isSelected ? { backgroundColor: filter.color } : undefined}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 지도 컨트롤 (우측) */}
          <div
            className={`absolute right-5 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3 ${
              hasGpsLocation ? "-mt-[90px]" : ""
            }`}
          >
            <div className="bg-white border border-[rgba(207,196,189,0.2)] rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden">
              <button
                onClick={handleZoomIn}
                className="size-[48px] flex items-center justify-center border-b border-[rgba(207,196,189,0.1)] transition-all active:scale-95 active:bg-[#f0ebe3]"
              >
                <Image
                  src="/icons/zoom-in.svg"
                  alt="확대"
                  width={14}
                  height={14}
                  className="size-[14px]"
                />
              </button>
              <button
                onClick={handleZoomOut}
                className="size-[48px] flex items-center justify-center transition-all active:scale-95 active:bg-[#f0ebe3]"
              >
                <Image
                  src="/icons/zoom-out.svg"
                  alt="축소"
                  width={14}
                  height={2}
                  className="w-[14px] h-[2px]"
                />
              </button>
            </div>
            <button
              onClick={handleGpsClick}
              className="bg-white border border-[rgba(207,196,189,0.2)] rounded-[12px] size-[48px] flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] transition-all active:scale-95 active:bg-[#f0ebe3]"
            >
              <Image
                src="/icons/gps.svg"
                alt="현재 위치"
                width={22}
                height={22}
                className="size-[22px]"
              />
            </button>
          </div>

          {/* 하단 정보 카드 */}
          <div className="absolute top-4 bottom-0 left-1/2 -translate-x-1/2 z-10 p-4 w-full flex flex-col justify-end pointer-events-none">
            {hasGpsLocation ? (
              <div
                className={`pointer-events-auto bg-white border border-[rgba(207,196,189,0.3)] rounded-[32px] shadow-[0px_20px_25px_rgba(0,0,0,0.1)] p-[25px] flex flex-col gap-3 overflow-y-auto transition-[max-height] duration-300 ${
                  isEventsExpanded ? "max-h-full" : "max-h-[280px]"
                }`}
              >
                <button
                  onClick={() => setIsEventsExpanded((prev) => !prev)}
                  className="w-full py-3 -mt-3 -mb-1 shrink-0 flex items-center justify-center"
                  aria-label={isEventsExpanded ? "목록 접기" : "목록 펼치기"}
                >
                  <span className="w-10 h-1 rounded-full bg-[rgba(207,196,189,0.6)]" />
                </button>
                <div className="flex items-end justify-between pb-1 shrink-0">
                  <p className="font-bold text-[20px] text-[#251e19] leading-[30px] tracking-[-0.5px]">
                    내 주변 추천 {Math.min(cultureEvents?.length ?? 0, 10)}곳
                  </p>
                  <div className="flex items-center gap-1">
                    {districtName && (
                      <span className="font-normal text-[12px] text-[#6b6763] leading-[18px]">{districtName}</span>
                    )}
                    <span className="font-normal text-[12px] text-[#6b6763] leading-[18px]">{NEARBY_EVENTS_RADIUS_KM}KM</span>
                    {mapScaleMeters != null && (
                      <span className="font-normal text-[12px] text-[#6b6763] leading-[18px]">
                        ({mapScaleMeters >= 1000
                          ? `${(mapScaleMeters / 1000).toFixed(1)}km`
                          : `${Math.round(mapScaleMeters)}m`})
                      </span>
                    )}
                  </div>
                </div>
                {isLoadingEvents ? (
                  <span className="font-medium text-[14px] text-[#6b6763] leading-[21px] text-center">
                    이벤트를 불러오는 중...
                  </span>
                ) : cultureEvents && cultureEvents.length > 0 ? (
                  cultureEvents.slice(0, 10).map((event) => (
                    <EventCard
                      key={event.eventItemId}
                      event={toEventCardData(event)}
                      shadow={false}
                      onClick={() => router.push(`/events/${event.eventItemId}`)}
                      onLike={() =>
                        handleToggleFavorite(event.eventItemId, event.isFavorited)
                      }
                    />
                  ))
                ) : (
                  <span className="font-medium text-[14px] text-[#6b6763] leading-[21px] text-center">
                    주변에 이벤트를 찾을 수 없습니다
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* BottomNav */}
        <div className="shrink-0">
          <BottomNav
            activeTab="recommend"
            onTabChange={(tab) => {
              if (tab === "home") router.push("/");
              if (tab === "curation") router.push("/recommendations");
              if (tab === "recommend") router.push("/explore");
              if (tab === "my") router.push("/mypage");
            }}
          />
        </div>
      </div>
    </div>
  );
}
