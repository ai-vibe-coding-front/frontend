import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

function isEventExpired(event: CultureEvent): boolean {
  const dateStr = event.endDate ?? event.startDate;
  if (!dateStr) return false;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return dateStr < todayStr;
}

type UseNearbyEventsOptions = {
  excludeExpiredEvents?: boolean;
};

export function useNearbyEvents(options: UseNearbyEventsOptions = {}) {
  const { excludeExpiredEvents = false } = options;
  const router = useRouter();
  const requestIdRef = useRef(0);
  const pendingFavoriteIdsRef = useRef<Set<string>>(new Set());

  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [cultureEvents, setCultureEvents] = useState<CultureEvent[] | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null,
  );
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const loadMoreEvents = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 10);
      setIsLoadingMore(false);
    }, 400);
  };

  const updateCultureEvents = (events: CultureEvent[]) => {
    const activeEvents = excludeExpiredEvents
      ? events.filter((event) => !isEventExpired(event))
      : events;
    setCultureEvents(activeEvents);
    setVisibleCount(10);
  };

  const fetchEvents = async (
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

  const handleToggleFavorite = async (
    eventItemId: string,
    isFavorited: boolean,
  ) => {
    if (pendingFavoriteIdsRef.current.has(eventItemId)) return;
    pendingFavoriteIdsRef.current.add(eventItemId);
    setFavoriteError(null);
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
      const response = isFavorited
        ? await fetch(`/api/favorites/${eventItemId}`, { method: "DELETE" })
        : await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventItemId }),
          });

      if (response.status === 401) {
        revert();
        router.push("/login");
        return;
      }

      if (response.status === 409) return;

      if (response.status === 404 && isFavorited) {
        const body = await response.json().catch(() => null);
        if (body?.errorCode === "FAVORITE_NOT_FOUND") return;
      }

      if (!response.ok) throw new Error("관심 행사 설정 요청이 실패했습니다.");
    } catch (err) {
      console.error("관심 행사 설정에 실패했습니다.", err);
      revert();
      setFavoriteError("관심 행사 설정에 실패했습니다.");
    } finally {
      pendingFavoriteIdsRef.current.delete(eventItemId);
    }
  };

  return {
    cultureEvents,
    isLoadingEvents,
    selectedCategory,
    setSelectedCategory,
    visibleCount,
    isLoadingMore,
    loadMoreEvents,
    favoriteError,
    fetchEvents,
    handleToggleFavorite,
  };
}
