'use client';
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { DDayBadge } from "@/components/common/DDayBadge";
import { EmojiBox } from "@/components/common/EmojiBox";

type Category =
  | "전시"
  | "음악/콘서트"
  | "행사/축제"
  | "연극"
  | "뮤지컬/오페라"
  | "국악"
  | "무용/발레"
  | "아동/가족"
  | "교육/체험";

export interface RecommendItemData {
  id: string;
  category: Category;
  title: string;
  venue: string;
  period: string;
  dDay: number;
}

interface RecommendItemProps {
  item: RecommendItemData;
  onClick?: () => void;
}

// TODO: replace with local chevron icon asset
const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4l4 4-4 4" stroke="#8c6e63" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// TODO: replace with local map pin icon asset
const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M5.5 1a3 3 0 0 1 3 3c0 2.25-3 6-3 6S2.5 6.25 2.5 4a3 3 0 0 1 3-3Z" stroke="#8c6e63" strokeWidth="1" />
  </svg>
);

// TODO: replace with local calendar icon asset
const CalendarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <rect x="1" y="2" width="9" height="8" rx="1.5" stroke="#bf8b6e" strokeWidth="1" />
    <path d="M3.5 1v2M7.5 1v2M1 5h9" stroke="#bf8b6e" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

export function RecommendItem({ item, onClick }: RecommendItemProps) {
  return (
    <div
      onClick={onClick}
      className="bg-[#fefefe] rounded-[18px] shadow-[0px_2px_6px_rgba(63,42,36,0.06)] h-[116px] w-full cursor-pointer"
    >
      <div className="flex gap-3 items-center p-4 h-full">
        <EmojiBox category={item.category} />

        <div className="flex flex-col flex-1 gap-0 min-w-0">
          <div className="flex items-center gap-2 h-[20.5px]">
            <CategoryBadge category={item.category} />
            <DDayBadge days={item.dDay} />
          </div>

          <p className="font-normal text-sm text-[#3f2a24] leading-[21px] mt-1 truncate">
            {item.title}
          </p>

          <div className="flex items-center gap-1 mt-0.5">
            <PinIcon />
            <span className="text-[12px] text-[#8c6e63] leading-[18px] truncate">
              {item.venue}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <CalendarIcon />
            <span className="text-[11px] text-[#bf8b6e] leading-[16.5px]">
              {item.period}
            </span>
          </div>
        </div>

        <ChevronIcon />
      </div>
    </div>
  );
}
