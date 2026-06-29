"use client";

export type StoredLocationSource = "gps" | "manual";

export type StoredLocation = {
  lat: number;
  lng: number;
  savedAt: number;
  source: StoredLocationSource;
  nx?: number;
  ny?: number;
  label?: string;
  sido?: string;
  stationName?: string;
};

const LOCATION_STORAGE_KEY = "muud:lastKnownLocation";
const LOCATION_STORAGE_EVENT = "muud:lastKnownLocationChanged";
const LOCATION_STORAGE_TTL_MS = 1000 * 60 * 60;

function isValidCoordinate(lat: unknown, lng: unknown) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function isValidStoredLocation(value: unknown): value is StoredLocation {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<StoredLocation>;
  const source = candidate.source;

  return (
    isValidCoordinate(candidate.lat, candidate.lng) &&
    typeof candidate.savedAt === "number" &&
    Number.isFinite(candidate.savedAt) &&
    (source === "gps" || source === "manual")
  );
}

function isExpired(savedAt: number) {
  return Date.now() - savedAt > LOCATION_STORAGE_TTL_MS;
}

function emitLocationStorageChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LOCATION_STORAGE_EVENT));
}

export function readLastKnownLocation(): StoredLocation | null {
  try {
    if (typeof sessionStorage === "undefined") return null;

    const raw = sessionStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValidStoredLocation(parsed) || isExpired(parsed.savedAt)) {
      clearLastKnownLocation(false);
      return null;
    }

    return parsed;
  } catch {
    clearLastKnownLocation(false);
    return null;
  }
}

export function saveLastKnownLocation(
  location: Omit<StoredLocation, "savedAt">,
) {
  if (!isValidCoordinate(location.lat, location.lng)) return;

  try {
    if (typeof sessionStorage === "undefined") return;

    sessionStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({
        ...location,
        savedAt: Date.now(),
      }),
    );
    emitLocationStorageChange();
  } catch {
    // Ignore storage failures. Location flows should keep working without cache.
  }
}

export function clearLastKnownLocation(shouldNotify = true) {
  try {
    if (typeof sessionStorage === "undefined") return;

    sessionStorage.removeItem(LOCATION_STORAGE_KEY);
    if (shouldNotify) {
      emitLocationStorageChange();
    }
  } catch {
    // Ignore storage failures. Invalid cache should not block location flows.
  }
}

export function subscribeToLastKnownLocation(listener: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(LOCATION_STORAGE_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(LOCATION_STORAGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function hasLastKnownLocation() {
  return readLastKnownLocation() !== null;
}

export function getLastKnownLocationServerSnapshot() {
  return false;
}
