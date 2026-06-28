"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export const INTERNAL_NAV_KEY = "muud:hasInternalNav";

// document.referrer는 최초 페이지 로드 시에만 기록되고 클라이언트 사이드 라우팅으로는
// 갱신되지 않아서, 앱 내부 이동 여부를 알 수 없다. pathname 변경을 감지해 세션 플래그로
// "앱 내부에서 한 번이라도 이동했는지"를 기록해 useSafeBack이 안전하게 참조할 수 있게 한다.
export function InternalNavigationTracker() {
  const pathname = usePathname();
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (hasMountedRef.current) {
      sessionStorage.setItem(INTERNAL_NAV_KEY, "1");
    }
    hasMountedRef.current = true;
  }, [pathname]);

  return null;
}

/**
 * 외부 사이트에서 바로 진입한 경우 router.back()이 앱 밖으로 나가는 것을 막기 위해,
 * 앱 내부에서 한 번이라도 이동한 적이 있을 때만 router.back()을 호출하고,
 * 아니면 fallback 경로로 이동한다. (내부 이동 여부는 InternalNavigationTracker가
 * 세션에 기록한다.)
 */
export function useSafeBack(fallback: string = "/") {
  const router = useRouter();

  return useCallback(() => {
    const hasInternalNav = sessionStorage.getItem(INTERNAL_NAV_KEY) === "1";

    if (hasInternalNav) {
      router.back();
    } else {
      router.push(fallback);
    }
  }, [router, fallback]);
}
