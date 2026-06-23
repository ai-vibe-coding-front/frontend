"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CTAButton } from "@/components/common/CTAButton";
import { BottomNav } from "@/components/layout/BottomNav";
import MapPinIcon from "@/components/common/MapPinIcon";
import { KakaoMap } from "@/features/location/KakaoMap";
import { useCurrentLocation } from "@/features/location/useCurrentLocation";

const DEFAULT_CENTER = { lat: 37.544581, lng: 127.055961 };
const MIN_ZOOM_LEVEL = 1;
const MAX_ZOOM_LEVEL = 14;
const NEARBY_EVENTS_RADIUS_KM = 30;
const NEARBY_EVENTS_LIMIT = 100;

type CultureEvent = {
  eventItemId: string;
  title: string;
  place: string | null;
  address: string | null;
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  lat: number;
  lng: number;
  distanceKm: number;
  isFavorited: boolean;
};

const EventAddressIcon = () => (
  <svg
    width="10"
    height="12"
    viewBox="0 0 10 12"
    fill="none"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      d="M5 1a3 3 0 0 1 3 3c0 2.25-3 6-3 6S2 6.25 2 4a3 3 0 0 1 3-3Z"
      stroke="#8c6e63"
      strokeWidth="1"
    />
  </svg>
);

const EventDateIcon = () => (
  <svg
    width="10"
    height="11"
    viewBox="0 0 10 11"
    fill="none"
    aria-hidden="true"
    className="shrink-0"
  >
    <rect
      x="0.5"
      y="1.5"
      width="9"
      height="8"
      rx="1.5"
      stroke="#bf8b6e"
      strokeWidth="1"
    />
    <path
      d="M3 0.5v2M7 0.5v2M0.5 4.5h9"
      stroke="#bf8b6e"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const GPS_PIN_OVERLAY_HTML = `
  <svg viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-[40px] h-[48px] drop-shadow-[0px_4px_1.5px_rgba(0,0,0,0.1)]">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C5.373 0 0 5.373 0 12C0 19.2 12 30 12 30C12 30 24 19.2 24 12C24 5.373 18.627 0 12 0ZM12 16C9.791 16 8 14.209 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.209 14.209 16 12 16Z" fill="#2D2926"/>
  </svg>
`;

function LocationSkeleton() {
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

export default function LocationPage() {
  const router = useRouter();
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const gpsOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const eventMarkersRef = useRef<kakao.maps.Marker[]>([]);
  const { getCurrentLocation } = useCurrentLocation();
  const [hasGpsLocation, setHasGpsLocation] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [cultureEvents, setCultureEvents] = useState<CultureEvent[] | null>(
    null,
  );
  const [isEventsExpanded, setIsEventsExpanded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isMapError, setIsMapError] = useState(false);

  const renderEventMarkers = (events: CultureEvent[]) => {
    eventMarkersRef.current.forEach((marker) => marker.setMap(null));
    eventMarkersRef.current = [];

    const map = mapRef.current;
    if (!map) return;

    eventMarkersRef.current = events.map(
      (event) =>
        new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(event.lat, event.lng),
          map,
        }),
    );
  };

  const updateCultureEvents = (events: CultureEvent[]) => {
    setCultureEvents(events);
    renderEventMarkers(events);
  };

  const fetchNearbyEvents = async (lat: number, lng: number) => {
    setIsLoadingEvents(true);
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radiusKm: String(NEARBY_EVENTS_RADIUS_KM),
        limit: String(NEARBY_EVENTS_LIMIT),
      });

      const response = await fetch(`/api/events/nearby?${params.toString()}`);
      if (!response.ok) {
        updateCultureEvents([]);
        return;
      }

      const data = await response.json();
      updateCultureEvents(Array.isArray(data.data?.items) ? data.data.items : []);
    } catch (err) {
      console.error("주변 이벤트를 가져오지 못했습니다.", err);
      updateCultureEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleGpsClick = async () => {
    const map = mapRef.current;
    if (!map) return;

    try {
      const { lat, lng } = await getCurrentLocation();
      setIsEventsExpanded(false);
      const position = new window.kakao.maps.LatLng(lat, lng);
      map.setCenter(position);

      if (gpsOverlayRef.current) {
        gpsOverlayRef.current.setPosition(position);
      } else {
        gpsOverlayRef.current = new window.kakao.maps.CustomOverlay({
          position,
          content: GPS_PIN_OVERLAY_HTML,
          yAnchor: 1,
        });
      }
      gpsOverlayRef.current.setMap(map);
      setHasGpsLocation(true);
      await fetchNearbyEvents(lat, lng);
    } catch (err) {
      console.error(
        "현재 위치를 가져오지 못했습니다. GPS 안 켜져 있습니다",
        err,
      );
    }
  };

  const handleZoomIn = () => {
    const map = mapRef.current;
    if (!map) return;
    map.setLevel(Math.max(MIN_ZOOM_LEVEL, map.getLevel() - 1), {
      animate: true,
    });
  };

  const handleZoomOut = () => {
    const map = mapRef.current;
    if (!map) return;
    map.setLevel(Math.min(MAX_ZOOM_LEVEL, map.getLevel() + 1), {
      animate: true,
    });
  };

  return (
    <div className="bg-[#f0ebe3] min-h-screen flex items-center justify-center">
      <div className="bg-[#fbf9f4] w-[390px] min-h-screen shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)] flex flex-col relative overflow-hidden">
        {/* TopAppBar */}
        <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] flex items-center px-6 relative shrink-0 z-10">
          <button
            onClick={() => router.back()}
            className="size-[16px] shrink-0"
          >
            <img
              src="/icons/back-arrow.svg"
              alt="뒤로가기"
              className="size-full"
            />
          </button>
          <p className="absolute inset-0 flex items-center justify-center font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px] pointer-events-none">
            위치 검색
          </p>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 relative">
          {/* 지도 배경 */}
          <KakaoMap
            center={DEFAULT_CENTER}
            className="absolute inset-0"
            onMapReady={(map) => {
              mapRef.current = map;
              setIsMapReady(true);
            }}
            onError={() => setIsMapError(true)}
          />
          {!isMapReady && !isMapError && <LocationSkeleton />}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(251,249,244,0.4) 0%, rgba(251,249,244,0) 20%, rgba(251,249,244,0) 80%, rgba(251,249,244,0.4) 100%)",
            }}
          />

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
                <img
                  src="/icons/zoom-in.svg"
                  alt="확대"
                  className="size-[14px]"
                />
              </button>
              <button
                onClick={handleZoomOut}
                className="size-[48px] flex items-center justify-center transition-all active:scale-95 active:bg-[#f0ebe3]"
              >
                <img
                  src="/icons/zoom-out.svg"
                  alt="축소"
                  className="w-[14px] h-[2px]"
                />
              </button>
            </div>
            <button
              onClick={handleGpsClick}
              className="bg-white border border-[rgba(207,196,189,0.2)] rounded-[12px] size-[48px] flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] transition-all active:scale-95 active:bg-[#f0ebe3]"
            >
              <img
                src="/icons/gps.svg"
                alt="현재 위치"
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
                  className="w-10 h-1 rounded-full bg-[rgba(207,196,189,0.6)] mx-auto -mt-1 mb-1 shrink-0"
                  aria-label={isEventsExpanded ? "목록 접기" : "목록 펼치기"}
                />
                {isLoadingEvents ? (
                  <span className="font-medium text-[14px] text-[#6b6763] leading-[21px] text-center">
                    이벤트를 불러오는 중...
                  </span>
                ) : cultureEvents && cultureEvents.length > 0 ? (
                  cultureEvents.slice(0, 10).map((event) => {
                    const address = event.address ?? event.place;
                    const dateRange = event.startDate
                      ? `${event.startDate} ~ ${event.endDate ?? ""}`
                      : null;

                    return (
                      <button
                        key={event.eventItemId}
                        type="button"
                        onClick={() => router.push(`/events/${event.eventItemId}`)}
                        className="flex gap-3 pb-3 border-b border-[rgba(207,196,189,0.2)] last:border-b-0 last:pb-0 text-left"
                      >
                        <div className="size-16 rounded-[12px] overflow-hidden bg-[#f0ebe3] shrink-0">
                          {event.imageUrl && (
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="size-full object-cover"
                              onError={(e) => {
                                (
                                  e.currentTarget as HTMLImageElement
                                ).style.display = "none";
                              }}
                            />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 min-w-0 justify-center">
                          <span className="font-bold text-[14px] text-[#251e19] leading-[21px] truncate">
                            {event.title}
                          </span>
                          {address && (
                            <div className="flex items-center gap-1">
                              <EventAddressIcon />
                              <span className="font-normal text-[12px] text-[#6b6763] leading-[18px] truncate">
                                {address}
                              </span>
                            </div>
                          )}
                          {dateRange && (
                            <div className="flex items-center gap-1">
                              <EventDateIcon />
                              <span className="font-normal text-[12px] text-[#6b6763] leading-[18px]">
                                {dateRange}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <span className="font-medium text-[14px] text-[#6b6763] leading-[21px] text-center">
                    주변에 이벤트를 찾을 수 없습니다
                  </span>
                )}
              </div>
            ) : (
              <div className="pointer-events-auto bg-white border border-[rgba(207,196,189,0.3)] rounded-[32px] shadow-[0px_20px_25px_rgba(0,0,0,0.1)] p-[25px] flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[12px] text-[#6b6763] leading-[18px] tracking-[-0.3px]">
                      현재 설정된 위치
                    </span>
                    <span className="font-bold text-[20px] text-[#251e19] leading-[25px]">
                      서울시 성동구 성수동
                    </span>
                  </div>
                  <div className="bg-[#f0fdf4] rounded-full px-3 py-1 shrink-0">
                    <span className="font-bold text-[11px] text-[#15803d] leading-[16.5px]">
                      정확도 높음
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pb-2 border-b border-[rgba(207,196,189,0.2)]">
                  <MapPinIcon className="w-[12px] h-[15px] shrink-0" />
                  <span className="font-normal text-[14px] text-[#4d4540] leading-[21px]">
                    서울특별시 성동구 아차산로 17길 48
                  </span>
                </div>

                <CTAButton label="이 위치로 설정" onClick={handleGpsClick} />
              </div>
            )}
          </div>
        </div>

        {/* BottomNav */}
        <div className="shrink-0">
          <BottomNav
            activeTab="recommend"
            onTabChange={(tab) => {
              if (tab === "home") router.push("/");
              if (tab === "curation") router.push("/recommendations");
              if (tab === "my") router.push("/mypage");
            }}
          />
        </div>
      </div>
    </div>
  );
}
