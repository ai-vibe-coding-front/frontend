"use client";

import { useEffect, useState } from "react";

const KAKAO_SDK_SRC = "https://dapi.kakao.com/v2/maps/sdk.js";

let kakaoLoaderPromise: Promise<void> | null = null;

function loadKakaoSdk(appKey: string): Promise<void> {
  if (window.kakao?.maps) {
    return Promise.resolve();
  }

  if (!kakaoLoaderPromise) {
    kakaoLoaderPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${KAKAO_SDK_SRC}?appkey=${appKey}&autoload=false`;
      script.async = true;
      script.onload = () => window.kakao.maps.load(() => resolve());
      script.onerror = () =>
        reject(new Error("Kakao Maps SDK 로드에 실패했습니다."));
      document.head.appendChild(script);
    });
  }

  return kakaoLoaderPromise;
}

export function useKakaoLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

    const promise = appKey
      ? loadKakaoSdk(appKey)
      : Promise.reject(
          new Error("NEXT_PUBLIC_KAKAO_MAP_KEY 설정되지 않았습니다."),
        );

    promise.then(() => setIsLoaded(true)).catch((err: Error) => setError(err));
  }, []);

  return { isLoaded, error };
}
