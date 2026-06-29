'use client';

type Coordinates = { lat: number; lng: number };

export function useCurrentLocation() {
  const getCurrentLocation = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!window.isSecureContext) {
        reject(new Error("GEOLOCATION_INSECURE_CONTEXT"));
        return;
      }

      if (!navigator.geolocation) {
        reject(new Error("이 브라우저는 위치 정보를 지원하지 않습니다."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (err) => reject(err),
        { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false },
      );
    });
  };

  return { getCurrentLocation };
}
