'use client';

type Coordinates = { lat: number; lng: number };

export function useCurrentLocation() {
  const getCurrentLocation = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("이 브라우저는 위치 정보를 지원하지 않습니다."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (err) => reject(err),
      );
    });
  };

  return { getCurrentLocation };
}
