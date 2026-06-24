"use client";

import { useRouter } from "next/navigation";
import { LocationPermissionModal } from "@/components/common/LocationPermissionModal";
import { useCurrentLocation } from "@/features/location/useCurrentLocation";
import { ROUTES } from "@/constants/routes";

export default function LocationPermissionPage() {
  const router = useRouter();
  const { getCurrentLocation } = useCurrentLocation();

  const moveToLocation = (coordinates: { lat: number; lng: number }) => {
    const params = new URLSearchParams({
      from: "permission",
      lat: String(coordinates.lat),
      lng: String(coordinates.lng),
    });
    router.push(`${ROUTES.location}?${params.toString()}`);
  };

  const handleAllow = async () => {
    try {
      moveToLocation(await getCurrentLocation());
    } catch {
      router.push(`${ROUTES.location}?from=permission`);
    }
  };

  return (
    <main className="min-h-dvh bg-[#f9f4ec]">
      <LocationPermissionModal
        onAllow={handleAllow}
        onSkip={() => router.push(ROUTES.home)}
      />
    </main>
  );
}
