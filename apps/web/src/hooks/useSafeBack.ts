"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * 외부 사이트에서 바로 진입한 경우 router.back()이 앱 밖으로 나가는 것을 막기 위해,
 * 같은 origin에서 온 경우에만 router.back()을 호출하고, 아니면 fallback 경로로 이동한다.
 */
export function useSafeBack(fallback: string = "/") {
  const router = useRouter();

  return useCallback(() => {
    const cameFromSameOrigin =
      !!document.referrer &&
      new URL(document.referrer).origin === window.location.origin;

    if (cameFromSameOrigin) {
      router.back();
    } else {
      router.push(fallback);
    }
  }, [router, fallback]);
}
