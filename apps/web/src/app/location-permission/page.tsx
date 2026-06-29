"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LocationPermissionModal } from "@/components/common/LocationPermissionModal";
import { useCurrentLocation } from "@/features/location/useCurrentLocation";
import { ROUTES } from "@/constants/routes";

const LOCATION_PERMISSION_TIMEOUT_MS = 10000;

type Coordinates = { lat: number; lng: number };

export default function LocationPermissionPage() {
  const router = useRouter();
  const { getCurrentLocation } = useCurrentLocation();
  const requestIdRef = useRef(0);
  const hasSkippedRef = useRef(false);
  const isMountedRef = useRef(true);
  const permissionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const clearPermissionTimeout = () => {
    if (!permissionTimeoutRef.current) return;
    clearTimeout(permissionTimeoutRef.current);
    permissionTimeoutRef.current = null;
  };

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
      clearPermissionTimeout();
    };
  }, []);

  const moveToLocation = (coordinates: Coordinates) => {
    const params = new URLSearchParams({
      from: "permission",
      lat: String(coordinates.lat),
      lng: String(coordinates.lng),
    });
    router.push(`${ROUTES.location}?${params.toString()}`);
  };

  const moveToManualLocation = () => {
    router.push(`${ROUTES.location}?from=permission&locationError=1`);
  };

  const handleAllow = async () => {
    if (isRequestingLocation) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    hasSkippedRef.current = false;
    setIsRequestingLocation(true);
    clearPermissionTimeout();

    permissionTimeoutRef.current = setTimeout(() => {
      permissionTimeoutRef.current = null;

      if (
        !isMountedRef.current ||
        hasSkippedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      requestIdRef.current += 1;
      setIsRequestingLocation(false);
      moveToManualLocation();
    }, LOCATION_PERMISSION_TIMEOUT_MS);

    try {
      const coordinates = await getCurrentLocation();
      if (
        !isMountedRef.current ||
        hasSkippedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      clearPermissionTimeout();
      moveToLocation(coordinates);
    } catch {
      if (
        !isMountedRef.current ||
        hasSkippedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      clearPermissionTimeout();
      moveToManualLocation();
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        clearPermissionTimeout();
        setIsRequestingLocation(false);
      }
    }
  };

  const handleSkip = () => {
    hasSkippedRef.current = true;
    requestIdRef.current += 1;
    clearPermissionTimeout();
    setIsRequestingLocation(false);
    router.push(ROUTES.home);
  };

  return (
    <main className="min-h-dvh bg-[#f9f4ec]">
      <LocationPermissionModal
        onAllow={handleAllow}
        onSkip={handleSkip}
        isAllowLoading={isRequestingLocation}
      />
    </main>
  );
}
