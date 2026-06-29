'use client';

import {
  createGeolocationError,
  normalizeGeolocationError,
} from '@/features/location/geolocationError';

type Coordinates = { lat: number; lng: number };

export function useCurrentLocation() {
  const getCurrentLocation = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!window.isSecureContext) {
        reject(createGeolocationError('insecure_context'));
        return;
      }

      if (!navigator.geolocation) {
        reject(createGeolocationError('unsupported'));
        return;
      }

      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          (err) => reject(normalizeGeolocationError(err)),
          { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false },
        );
      } catch (err) {
        reject(normalizeGeolocationError(err));
      }
    });
  };

  return { getCurrentLocation };
}
