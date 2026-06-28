"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";

type TabId = "home" | "questions" | "explore" | "mypage";

const ICONS: Record<TabId, { active: string; inactive: string }> = {
  home:      { active: "/icons/home-active.svg",      inactive: "/icons/home-inactive.svg" },
  questions: { active: "/icons/curation-active.svg",  inactive: "/icons/curation-inactive.svg" },
  explore:   { active: "/icons/recommend-active.svg", inactive: "/icons/recommend-inactive.svg" },
  mypage:    { active: "/icons/my-active.svg",        inactive: "/icons/my-inactive.svg" },
};

const TABS: { id: TabId; label: string; route: string }[] = [
  { id: "home",      label: "홈",        route: ROUTES.home },
  { id: "questions", label: "추천 받기",  route: ROUTES.questions },
  { id: "explore",   label: "추천 탐색",  route: ROUTES.explore },
  { id: "mypage",    label: "마이",      route: ROUTES.mypage },
];

/** route 자체이거나, route 뒤에 `/`로 이어지는 하위 경로일 때만 매칭 (예: /location-permission이 /location에 잘못 매칭되는 것을 방지) */
function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function getActiveTab(pathname: string): TabId | null {
  // /location은 큐레이션(질문) 흐름 중 위치 입력 단계라 questions 탭으로 묶인다
  if (matchesRoute(pathname, ROUTES.location)) return "questions";
  if (matchesRoute(pathname, ROUTES.recommendations)) return null;
  // TABS에 속하지 않는 경로(예: /login)는 BottomNav를 렌더링하지 않으므로 home으로 기본 처리해도 무방
  return TABS.find((tab) => matchesRoute(pathname, tab.route))?.id ?? "home";
}

const labelClass = "font-bold text-[11px] leading-[11px] tracking-[-0.32px]";

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  return (
    <nav className="bg-[rgba(251,249,244,0.95)] flex h-[60px] w-full shadow-[0px_-8px_30px_0px_rgba(0,0,0,0.1)]">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => !isActive && router.push(tab.route)}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-1 flex-col gap-1 h-[59px] items-center justify-center"
          >
            <Image
              src={isActive ? ICONS[tab.id].active : ICONS[tab.id].inactive}
              alt={tab.label}
              width={20}
              height={20}
              className="size-5 object-contain"
            />
            <span className={`${labelClass} ${isActive ? "text-[#2d2926]" : "text-[rgba(45,41,38,0.4)]"}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
