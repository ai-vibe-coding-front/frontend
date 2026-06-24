'use client';

import { useEffect, useRef } from "react";
import { useKakaoLoader } from "./useKakaoLoader";

type KakaoMapProps = {
  center: { lat: number; lng: number };
  level?: number;
  className?: string;
  onMapReady?: (map: kakao.maps.Map) => void;
  onError?: (error: Error) => void;
};

export function KakaoMap({ center, level = 3, className, onMapReady, onError }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const hasReportedErrorRef = useRef(false);
  const { isLoaded, error } = useKakaoLoader();

  useEffect(() => {
    if (!error || hasReportedErrorRef.current) return;
    hasReportedErrorRef.current = true;
    onError?.(error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapInstanceRef.current) {
      return;
    }

    // 최초 1회만 지도를 생성한다. center/level은 초기값으로만 사용된다.
    // (StrictMode에서 effect가 두 번 실행되어도 지도가 중복 생성되지 않도록 ref로 가드한다)
    const map = new window.kakao.maps.Map(containerRef.current, {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level,
    });
    mapInstanceRef.current = map;
    onMapReady?.(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  if (error) {
    return (
      <div className={className}>
        <div className="absolute inset-0 flex items-center justify-center bg-[#e8e0d5] text-[13px] text-[#6b6763]">
          지도를 불러오지 못했습니다.
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
