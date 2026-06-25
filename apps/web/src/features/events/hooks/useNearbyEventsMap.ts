import { useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useCurrentLocation } from "@/features/location/useCurrentLocation";

const MIN_ZOOM_LEVEL = 1;
const MAX_ZOOM_LEVEL = 14;
export const NEARBY_EVENTS_RADIUS_KM = 10;
const NEARBY_EVENTS_LIMIT = 1000;

export type CultureEvent = {
  eventItemId: string;
  title: string;
  realmName: string | null;
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

const EARTH_RADIUS_M = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

const LOCATION_STORAGE_KEY = "explore:lastGpsLocation";

const GPS_PIN_OVERLAY_HTML = `
  <svg viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-[40px] h-[48px] drop-shadow-[0px_4px_1.5px_rgba(0,0,0,0.1)]">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C5.373 0 0 5.373 0 12C0 19.2 12 30 12 30C12 30 24 19.2 24 12C24 5.373 18.627 0 12 0ZM12 16C9.791 16 8 14.209 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.209 14.209 16 12 16Z" fill="#2D2926"/>
  </svg>
`;

type UseNearbyEventsMapOptions = {
  persistLocation?: boolean;
};

function readStoredLocation(): { lat: number; lng: number } | null {
  try {
    const raw = sessionStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.lat !== "number" || typeof parsed.lng !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function subscribeToStoredLocation() {
  return () => {};
}

function getHasStoredLocationSnapshot(): boolean {
  return readStoredLocation() !== null;
}

function getHasStoredLocationServerSnapshot(): boolean {
  return false;
}

export function useNearbyEventsMap(options: UseNearbyEventsMapOptions = {}) {
  const { persistLocation = false } = options;
  const router = useRouter();
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const gpsOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const eventMarkersRef = useRef<kakao.maps.Marker[]>([]);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const selectedCategoryRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);
  const { getCurrentLocation } = useCurrentLocation();

  const [rawHasGpsLocation, setHasGpsLocation] = useState(false);
  const hasStoredLocation = useSyncExternalStore(
    subscribeToStoredLocation,
    getHasStoredLocationSnapshot,
    getHasStoredLocationServerSnapshot,
  );
  const hasGpsLocation = rawHasGpsLocation || (persistLocation && hasStoredLocation);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [cultureEvents, setCultureEvents] = useState<CultureEvent[] | null>(
    null,
  );
  const [isEventsExpanded, setIsEventsExpanded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isMapError, setIsMapError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null,
  );
  const [districtName, setDistrictName] = useState<string | null>(null);
  const [mapScaleMeters, setMapScaleMeters] = useState<number | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMoreEvents = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 10);
      setIsLoadingMore(false);
    }, 400);
  };

  const handleMarkerClick = (event: CultureEvent) => {
    setSelectedEventId(event.eventItemId);
    setIsEventsExpanded(true);
  };

  const renderEventMarkers = (events: CultureEvent[]) => {
    eventMarkersRef.current.forEach((marker) => marker.setMap(null));
    eventMarkersRef.current = [];

    const map = mapRef.current;
    if (!map) return;

    eventMarkersRef.current = events.map((event) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(event.lat, event.lng),
        map,
      });
      window.kakao.maps.event.addListener(marker, "click", () => {
        handleMarkerClick(event);
      });
      return marker;
    });
  };

  const updateCultureEvents = (events: CultureEvent[]) => {
    setCultureEvents(events);
    renderEventMarkers(events);
    setSelectedEventId((prev) =>
      prev && events.some((event) => event.eventItemId === prev) ? prev : null,
    );
    setVisibleCount(10);
  };

  const fetchNearbyEvents = async (
    lat: number,
    lng: number,
    category: string | null,
  ) => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    setIsLoadingEvents(true);
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radiusKm: String(NEARBY_EVENTS_RADIUS_KM),
        limit: String(NEARBY_EVENTS_LIMIT),
        ...(category ? { category } : {}),
      });

      const response = await fetch(`/api/events/nearby?${params.toString()}`);
      if (requestId !== requestIdRef.current) return;

      if (!response.ok) {
        updateCultureEvents([]);
        return;
      }

      const data = await response.json();
      if (requestId !== requestIdRef.current) return;

      updateCultureEvents(
        Array.isArray(data.data?.items) ? data.data.items : [],
      );
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("주변 이벤트를 가져오지 못했습니다.", err);
      updateCultureEvents([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoadingEvents(false);
      }
    }
  };

  const resolveDistrictName = (lat: number, lng: number) => {
    if (!window.kakao.maps.services) {
      console.error("Kakao services 라이브러리가 로드되지 않았습니다.");
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(lng, lat, (result, status) => {
      if (status !== window.kakao.maps.services.Status.OK) {
        console.error("행정구역 조회에 실패했습니다.", status);
        return;
      }

      const region = result.find((item) => item.region_type === "H") ?? result[0];
      if (region) setDistrictName(region.region_2depth_name);
    });
  };

  const updateMapScale = () => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    setMapScaleMeters(calculateDistanceMeters(sw.getLat(), sw.getLng(), sw.getLat(), ne.getLng()));
  };

  const applyLocation = (lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;

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
    lastPositionRef.current = { lat, lng };
    resolveDistrictName(lat, lng);
  };

  const applyKnownLocation = async (lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;

    setIsEventsExpanded(false);
    applyLocation(lat, lng);

    if (persistLocation) {
      sessionStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ lat, lng }));
    }

    await fetchNearbyEvents(lat, lng, selectedCategory);
  };

  const handleGpsClick = async () => {
    try {
      const { lat, lng } = await getCurrentLocation();
      await applyKnownLocation(lat, lng);
    } catch (err) {
      console.error(
        "현재 위치를 가져오지 못했습니다. GPS 안 켜져 있습니다",
        err,
      );
    }
  };

  const restoreSavedLocation = async () => {
    if (!persistLocation) return;
    const saved = readStoredLocation();
    if (!saved) return;

    applyLocation(saved.lat, saved.lng);
    await fetchNearbyEvents(saved.lat, saved.lng, selectedCategory);
  };

  const handleCategorySelect = async (category: string | null) => {
    setSelectedCategory(category);
    selectedCategoryRef.current = category;
    const position = lastPositionRef.current;
    if (!position) return;
    setIsEventsExpanded(false);
    await fetchNearbyEvents(position.lat, position.lng, category);
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

  const handleToggleFavorite = async (
    eventItemId: string,
    isFavorited: boolean,
  ) => {
    setCultureEvents((prev) =>
      prev
        ? prev.map((event) =>
            event.eventItemId === eventItemId
              ? { ...event, isFavorited: !isFavorited }
              : event,
          )
        : prev,
    );

    const revert = () => {
      setCultureEvents((prev) =>
        prev
          ? prev.map((event) =>
              event.eventItemId === eventItemId
                ? { ...event, isFavorited }
                : event,
            )
          : prev,
      );
    };

    try {
      const response = await fetch(`/api/events/${eventItemId}/favorite`, {
        method: isFavorited ? "DELETE" : "POST",
      });

      if (response.status === 401) {
        revert();
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error("관심 행사 설정 요청이 실패했습니다.");
    } catch (err) {
      console.error("관심 행사 설정에 실패했습니다.", err);
      revert();
    }
  };

  const handleMapDragEnd = (map: kakao.maps.Map) => {
    if (!lastPositionRef.current) return;
    const center = map.getCenter();
    const lat = center.getLat();
    const lng = center.getLng();
    lastPositionRef.current = { lat, lng };
    setSelectedEventId(null);
    fetchNearbyEvents(lat, lng, selectedCategoryRef.current);
  };

  const onMapReady = (map: kakao.maps.Map) => {
    mapRef.current = map;
    setIsMapReady(true);
    window.kakao.maps.event.addListener(map, "zoom_changed", updateMapScale);
    window.kakao.maps.event.addListener(map, "dragend", () => {
      handleMapDragEnd(map);
    });
    updateMapScale();
    restoreSavedLocation();
  };

  const onMapError = () => setIsMapError(true);

  return {
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
    selectedEventId,
    visibleCount,
    loadMoreEvents,
    isLoadingMore,
    onMapReady,
    onMapError,
    handleGpsClick,
    applyKnownLocation,
    handleCategorySelect,
    handleZoomIn,
    handleZoomOut,
    handleToggleFavorite,
  };
}
