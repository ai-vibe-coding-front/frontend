"use client";

type TabId = "home" | "curation" | "recommend" | "my";

const ICONS: Record<TabId, { active: string; inactive: string }> = {
  home:      { active: "/icons/home-active.svg",      inactive: "/icons/home-inactive.svg" },
  curation:  { active: "/icons/curation-active.svg",  inactive: "/icons/curation-inactive.svg" },
  recommend: { active: "/icons/recommend-active.svg", inactive: "/icons/recommend-inactive.svg" },
  my:        { active: "/icons/my-active.svg",        inactive: "/icons/my-inactive.svg" },
};

const TABS: { id: TabId; label: string }[] = [
  { id: "home",      label: "홈" },
  { id: "curation",  label: "추천 받기" },
  { id: "recommend", label: "추천 탐색" },
  { id: "my",        label: "마이" },
];

interface BottomNavProps {
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}

const labelClass = "font-bold text-[11px] leading-[11px] tracking-[-0.32px]";

export function BottomNav({ activeTab = "home", onTabChange }: BottomNavProps) {
  return (
    <nav className="bg-[rgba(245,243,238,0.95)] flex h-[60px] w-full shadow-[0px_-8px_30px_0px_rgba(0,0,0,0.1)]">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className="flex flex-1 flex-col gap-1 h-[59px] items-center justify-center"
          >
            <img
              src={isActive ? ICONS[tab.id].active : ICONS[tab.id].inactive}
              alt={tab.label}
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
