'use client';

import { useEffect, useRef } from 'react';
import MapPinIcon from '@/components/common/MapPinIcon';

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => object;
        Map: new (container: HTMLElement, options: object) => object;
        Marker: new (options: object) => { setMap: (map: object) => void };
      };
    };
  }
}

type Props = {
  latitude: number;
  longitude: number;
  venueName: string;
};

export function KakaoMap({ latitude, longitude, venueName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!apiKey || !containerRef.current) return;

    const existingScript = document.getElementById('kakao-map-script');

    const initMap = () => {
      window.kakao.maps.load(() => {
        if (!containerRef.current) return;
        const coords = new window.kakao.maps.LatLng(latitude, longitude);
        const map = new window.kakao.maps.Map(containerRef.current, {
          center: coords,
          level: 3,
        });
        const marker = new window.kakao.maps.Marker({ position: coords });
        marker.setMap(map);
      });
    };

    if (existingScript) {
      if (window.kakao?.maps) initMap();
      else existingScript.addEventListener('load', initMap);
      return;
    }

    const script = document.createElement('script');
    script.id = 'kakao-map-script';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.addEventListener('load', initMap);
    document.head.appendChild(script);
  }, [latitude, longitude]);

  return (
    <div className="border border-[#ded0be] rounded-[20px] shadow-[0px_2px_12px_0px_rgba(63,42,36,0.06)] overflow-hidden h-[298.5px] w-full shrink-0">
      <div ref={containerRef} className="w-full h-full" aria-label={`${venueName} 지도`} />
    </div>
  );
}

export function KakaoMapFallback() {
  return (
    <div className="border border-[#ded0be] rounded-[20px] shadow-[0px_2px_12px_0px_rgba(63,42,36,0.06)] overflow-hidden h-[298.5px] w-full shrink-0">
      <div className="w-full h-full bg-[#e8e0d5] flex items-center justify-center">
        <MapPinIcon className="size-8" />
      </div>
    </div>
  );
}
