"use client";

import Image from "next/image";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CTAButton } from "@/components/common/CTAButton";
import { BottomNav } from "@/components/layout/BottomNav";
import MapPinIcon from "@/components/common/MapPinIcon";
import { KakaoMap } from "@/features/location/KakaoMap";
import { useCurrentLocation } from "@/features/location/useCurrentLocation";
import { ROUTES } from "@/constants/routes";

const DEFAULT_CENTER = { lat: 37.544581, lng: 127.055961 };
const MIN_ZOOM_LEVEL = 1;
const MAX_ZOOM_LEVEL = 14;

type LocationInfo = {
  lat: number;
  lng: number;
  nx?: number;
  ny?: number;
  sido?: string;
  label?: string;
  stationName?: string;
  districtName?: string;
};

type AddressResult = {
  address?: {
    address_name?: string;
    region_1depth_name?: string;
    region_2depth_name?: string;
    region_3depth_name?: string;
  };
  road_address?: {
    address_name?: string;
    building_name?: string;
    region_1depth_name?: string;
    region_2depth_name?: string;
    region_3depth_name?: string;
  };
};

type PlaceSearchResult = {
  distance?: string;
  place_name?: string;
};

type PlacesSearchOptions = {
  location: kakao.maps.LatLng;
  radius: number;
  sort?: string;
};

type PlacesService = {
  categorySearch: (
    category: string,
    callback: (result: PlaceSearchResult[], status: string) => void,
    options: PlacesSearchOptions,
  ) => void;
};

type KakaoServicesWithPlaces = typeof kakao.maps.services & {
  Places?: new () => PlacesService;
  SortBy?: {
    DISTANCE?: string;
  };
};

const FACILITY_CATEGORY_CODES = ["SW8", "PK6", "CT1", "PO3", "AT4", "AD5"] as const;
const FACILITY_SEARCH_RADIUS_M = 25;

type GeocoderWithAddress = kakao.maps.services.Geocoder & {
  coord2Address: (
    lng: number,
    lat: number,
    callback: (result: AddressResult[], status: string) => void,
  ) => void;
};

function toWeatherGrid(lat: number, lng: number) {
  const earthRadiusKm = 6371.00877;
  const grid = 5.0;
  const slat1 = 30.0;
  const slat2 = 60.0;
  const olon = 126.0;
  const olat = 38.0;
  const xo = 43;
  const yo = 136;
  const degrad = Math.PI / 180.0;

  const re = earthRadiusKm / grid;
  const slat1Rad = slat1 * degrad;
  const slat2Rad = slat2 * degrad;
  const olonRad = olon * degrad;
  const olatRad = olat * degrad;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2Rad * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1Rad * 0.5);
  sn = Math.log(Math.cos(slat1Rad) / Math.cos(slat2Rad)) / Math.log(sn);

  let sf = Math.tan(Math.PI * 0.25 + slat1Rad * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1Rad)) / sn;

  let ro = Math.tan(Math.PI * 0.25 + olatRad * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * degrad * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);

  let theta = lng * degrad - olonRad;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  return {
    nx: Math.floor(ra * Math.sin(theta) + xo + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + yo + 0.5),
  };
}

function appendIfPresent(params: URLSearchParams, key: string, value?: string | number) {
  if (value === undefined || value === null || value === "") return;
  params.set(key, String(value));
}

function getShortAddressName(address?: string) {
  if (!address) return undefined;

  const parts = address.split(" ").filter(Boolean);
  if (parts.length <= 2) return address;

  return parts.slice(-2).join(" ");
}

async function getNearbyFacilityName(lat: number, lng: number) {
  const services = window.kakao.maps.services as KakaoServicesWithPlaces;
  const Places = services.Places;
  if (!Places) return undefined;

  return Promise.all(
    FACILITY_CATEGORY_CODES.map(
      (category) =>
        new Promise<PlaceSearchResult | undefined>((resolve) => {
          const places = new Places();

          places.categorySearch(
            category,
            (placeResult, placeStatus) => {
              resolve(
                placeStatus === window.kakao.maps.services.Status.OK
                  ? placeResult[0]
                  : undefined,
              );
            },
            {
              location: new window.kakao.maps.LatLng(lat, lng),
              radius: FACILITY_SEARCH_RADIUS_M,
              sort: services.SortBy?.DISTANCE,
            },
          );
        }),
    ),
  ).then(
    (places) =>
      places
        .filter((place): place is PlaceSearchResult => Boolean(place?.place_name))
        .sort(
          (a, b) =>
            Number(a.distance ?? Number.POSITIVE_INFINITY) -
            Number(b.distance ?? Number.POSITIVE_INFINITY),
        )[0]?.place_name,
  );
}

function isCompleteLocationInfo(
  locationInfo: LocationInfo | null,
): locationInfo is LocationInfo & {
  nx: number;
  ny: number;
  sido: string;
  label: string;
  stationName: string;
} {
  return Boolean(
    locationInfo &&
      Number.isFinite(locationInfo.lat) &&
      Number.isFinite(locationInfo.lng) &&
      Number.isFinite(locationInfo.nx) &&
      Number.isFinite(locationInfo.ny) &&
      locationInfo.sido &&
      locationInfo.label &&
      locationInfo.stationName,
  );
}

function getInitialCenter(searchParams: URLSearchParams) {
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  if (!latParam || !lngParam) return DEFAULT_CENTER;

  const lat = Number(latParam);
  const lng = Number(lngParam);

  return Number.isFinite(lat) && Number.isFinite(lng)
    ? { lat, lng }
    : DEFAULT_CENTER;
}

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

function LocationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getCurrentLocation } = useCurrentLocation();
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const requestIdRef = useRef(0);

  const initialCenter = useMemo(() => getInitialCenter(searchParams), [searchParams]);

  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isMapError, setIsMapError] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);

  const resolveLocationInfo = useCallback((lat: number, lng: number) => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    const grid = toWeatherGrid(lat, lng);
    const finishResolvingIfCurrentRequest = () => {
      if (requestId === requestIdRef.current) {
        setIsResolvingLocation(false);
      }
    };

    setIsResolvingLocation(true);
    setLocationInfo({
      lat,
      lng,
      nx: grid.nx,
      ny: grid.ny,
    });

    if (!window.kakao.maps.services) {
      finishResolvingIfCurrentRequest();
      return;
    }

    try {
      const geocoder = new window.kakao.maps.services.Geocoder() as GeocoderWithAddress;

      geocoder.coord2Address(lng, lat, (addressResult, addressStatus) => {
        // Stale responses belong to an older request. Do not clear resolving here,
        // because a newer request may still be running and the CTA must stay disabled.
        if (requestId !== requestIdRef.current) return;

        void (async () => {
          try {
            const detailAddress =
              addressStatus === window.kakao.maps.services.Status.OK
                ? (addressResult[0]?.road_address?.address_name ??
                  addressResult[0]?.address?.address_name)
                : undefined;

            const { regionResult, regionStatus } = await new Promise<{
              regionResult: Parameters<
                Parameters<kakao.maps.services.Geocoder["coord2RegionCode"]>[2]
              >[0];
              regionStatus: Parameters<
                Parameters<kakao.maps.services.Geocoder["coord2RegionCode"]>[2]
              >[1];
            }>((resolve) => {
              geocoder.coord2RegionCode(lng, lat, (result, status) => {
                resolve({ regionResult: result, regionStatus: status });
              });
            });

            // Same stale guard after the second async lookup: only the latest request
            // may update state or finish resolving, otherwise the CTA can enable too early.
            if (requestId !== requestIdRef.current) return;

            const region =
              regionStatus === window.kakao.maps.services.Status.OK
                ? (regionResult.find((item) => item.region_type === "H") ?? regionResult[0])
                : undefined;

            const buildingName = addressResult[0]?.road_address?.building_name;
            const facilityName = buildingName
              ? undefined
              : await getNearbyFacilityName(lat, lng);

            if (requestId !== requestIdRef.current) return;

            const districtName =
              buildingName ||
              facilityName ||
              getShortAddressName(detailAddress) ||
              (region?.region_3depth_name || region?.region_2depth_name);
            const label =
              detailAddress ??
              [region?.region_1depth_name, region?.region_2depth_name, region?.region_3depth_name]
                .filter(Boolean)
                .join(" ");

            setLocationInfo({
              lat,
              lng,
              nx: grid.nx,
              ny: grid.ny,
              sido: region?.region_1depth_name,
              label,
              stationName: region?.region_2depth_name,
              districtName,
            });
          } finally {
            finishResolvingIfCurrentRequest();
          }
        })();
      });
    } catch (err) {
      console.error("주소 정보를 확인하지 못했습니다.", err);
      finishResolvingIfCurrentRequest();
    }
  }, []);

  const moveMapTo = useCallback(
    (lat: number, lng: number) => {
      const map = mapRef.current;
      if (!map) return;

      map.setCenter(new window.kakao.maps.LatLng(lat, lng));
      resolveLocationInfo(lat, lng);
    },
    [resolveLocationInfo],
  );

  const handleGpsClick = async () => {
    try {
      const { lat, lng } = await getCurrentLocation();
      moveMapTo(lat, lng);
    } catch (err) {
      console.error("현재 위치를 가져오지 못했습니다.", err);
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

  const handleLocationConfirm = () => {
    if (isResolvingLocation || !isCompleteLocationInfo(locationInfo)) return;

    const params = new URLSearchParams();
    appendIfPresent(params, "lat", locationInfo.lat);
    appendIfPresent(params, "lng", locationInfo.lng);
    appendIfPresent(params, "nx", locationInfo.nx);
    appendIfPresent(params, "ny", locationInfo.ny);
    appendIfPresent(params, "sido", locationInfo.sido);
    appendIfPresent(params, "label", locationInfo.label);
    appendIfPresent(params, "stationName", locationInfo.stationName);

    router.push(`${ROUTES.questions}?${params.toString()}`);
  };

  const onMapReady = (map: kakao.maps.Map) => {
    mapRef.current = map;
    setIsMapReady(true);
    resolveLocationInfo(initialCenter.lat, initialCenter.lng);

    window.kakao.maps.event.addListener(map, "idle", () => {
      const center = map.getCenter();
      resolveLocationInfo(center.getLat(), center.getLng());
    });
  };

  const onMapError = () => setIsMapError(true);

  const districtName = locationInfo?.districtName ?? "위치 확인 중";
  const detailAddress = locationInfo?.label ?? "현재 위치의 주소를 확인하고 있습니다.";
  const canConfirm = !isResolvingLocation && isCompleteLocationInfo(locationInfo);

  return (
    <div className="bg-[#f0ebe3] min-h-screen flex items-center justify-center">
      <div className="bg-[#fbf9f4] w-[390px] min-h-screen shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)] flex flex-col relative overflow-hidden">
        <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] flex items-center px-6 relative shrink-0 z-10">
          <button
            type="button"
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
            위치 검색
          </p>
        </div>

        <div className="flex-1 relative">
          <KakaoMap
            center={initialCenter}
            className="absolute inset-0"
            onMapReady={onMapReady}
            onError={onMapError}
          />
          {!isMapReady && !isMapError && <LocationSkeleton />}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(251,249,244,0.4) 0%, rgba(251,249,244,0) 20%, rgba(251,249,244,0) 80%, rgba(251,249,244,0.4) 100%)",
            }}
          />

          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full pointer-events-none">
            <MapPinIcon className="w-[34px] h-[42px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.18)]" />
          </div>

          <div className="absolute right-5 top-1/2 -translate-y-1/2 -mt-[70px] z-10 flex flex-col gap-3">
            <div className="bg-white border border-[rgba(207,196,189,0.2)] rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden">
              <button
                type="button"
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
                type="button"
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
              type="button"
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

          <div className="absolute top-4 bottom-0 left-1/2 -translate-x-1/2 z-10 p-4 w-full flex flex-col justify-end pointer-events-none">
            <div className="pointer-events-auto bg-white border border-[rgba(207,196,189,0.3)] rounded-[32px] shadow-[0px_20px_25px_rgba(0,0,0,0.1)] p-[25px] flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-medium text-[12px] text-[#6b6763] leading-[18px] tracking-[-0.3px]">
                    현재 설정된 위치
                  </span>
                  <span className="font-bold text-[20px] text-[#251e19] leading-[25px] truncate">
                    {districtName}
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
                  {isResolvingLocation ? "주소를 확인하고 있습니다." : detailAddress}
                </span>
              </div>

              <CTAButton
                label={isResolvingLocation ? "위치 확인 중..." : "이 위치로 설정"}
                onClick={handleLocationConfirm}
                disabled={!canConfirm}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <BottomNav
            activeTab="recommend"
            onTabChange={(tab) => {
              if (tab === "home") router.push(ROUTES.home);
              if (tab === "curation") router.push(ROUTES.questions);
              if (tab === "recommend") router.push(ROUTES.recommendations);
              if (tab === "my") router.push(ROUTES.mypage);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function LocationPage() {
  return (
    <Suspense fallback={null}>
      <LocationContent />
    </Suspense>
  );
}
