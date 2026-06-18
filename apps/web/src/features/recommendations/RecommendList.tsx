'use client';
import { RecommendItem, type RecommendItemData } from "@/features/recommendations/RecommendItem";

interface RecommendListProps {
  items: RecommendItemData[];
  onViewAll?: () => void;
  onItemClick?: (item: RecommendItemData) => void;
}

// TODO: replace with local chevron icon asset
const ChevronRightSmall = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 3.5l3.5 3.5L5 10.5" stroke="#8c6e63" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function RecommendList({ items, onViewAll, onItemClick }: RecommendListProps) {
  return (
    <div className="w-full pt-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-base text-[#3f2a24] leading-6">
          최근 추천 결과
        </h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-0.5"
        >
          <span className="text-[13px] text-[#8c6e63] leading-[19.5px]">
            전체 보기
          </span>
          <ChevronRightSmall />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <RecommendItem
            key={item.id}
            item={item}
            onClick={() => onItemClick?.(item)}
          />
        ))}
      </div>
    </div>
  );
}
