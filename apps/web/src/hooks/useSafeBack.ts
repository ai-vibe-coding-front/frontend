"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * 외부 사이트에서 바로 진입한 경우 router.back()이 앱 밖으로 나가는 것을 막기 위해,
 * 히스토리가 없으면 fallback 경로로 이동한다.
 */
export function useSafeBack(fallback: string = "/") {
  const router = useRouter();

  return useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }, [router, fallback]);
}
