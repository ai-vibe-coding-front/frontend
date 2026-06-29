"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LocationPermissionModal } from "@/components/common/LocationPermissionModal";
import { useCurrentLocation } from "@/features/location/useCurrentLocation";
import { ROUTES } from "@/constants/routes";

export default function LocationPermissionPage() {
  const router = useRouter();
  const { getCurrentLocation } = useCurrentLocation();
  const requestIdRef = useRef(0);
  const hasSkippedRef = useRef(false);
  const isMountedRef = useRef(true);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  const moveToLocation = (coordinates: { lat: number; lng: number }) => {
    const params = new URLSearchParams({
      from: "permission",
      lat: String(coordinates.lat),
      lng: String(coordinates.lng),
    });
    router.push(`${ROUTES.location}?${params.toString()}`);
  };

  const handleAllow = async () => {
    if (isRequestingLocation) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    hasSkippedRef.current = false;
    setIsRequestingLocation(true);

    try {
      const coordinates = await getCurrentLocation();
      if (
        !isMountedRef.current ||
        hasSkippedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      moveToLocation(coordinates);
    } catch {
      if (
        !isMountedRef.current ||
        hasSkippedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      router.push(`${ROUTES.location}?from=permission`);
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setIsRequestingLocation(false);
      }
    }
  };

  const handleSkip = () => {
    hasSkippedRef.current = true;
    requestIdRef.current += 1;
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
