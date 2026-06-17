'use client';
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { DDayBadge } from "@/components/common/DDayBadge";

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

export interface EventCardData {
  id: string;
  category: Category;
  title: string;
  venue: string;
  period: string;
  dDay: number;
  imageUrl?: string;
  liked?: boolean;
}

interface EventCardProps {
  event: EventCardData;
  onClick?: () => void;
  onLike?: () => void;
  /** overflow 컨테이너 안에서 사용할 때 그림자가 잘리므로 false로 전달 */
  shadow?: boolean;
}

const PinIcon = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden="true">
    <path d="M5 1a3 3 0 0 1 3 3c0 2.25-3 6-3 6S2 6.25 2 4a3 3 0 0 1 3-3Z" stroke="#8c6e63" strokeWidth="1" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="10" height="11" viewBox="0 0 10 11" fill="none" aria-hidden="true">
    <rect x="0.5" y="1.5" width="9" height="8" rx="1.5" stroke="#bf8b6e" strokeWidth="1" />
    <path d="M3 0.5v2M7 0.5v2M0.5 4.5h9" stroke="#bf8b6e" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const metaRowClass = "flex items-center gap-1";

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M10 17S3 12.5 3 7.5A4 4 0 0 1 10 5a4 4 0 0 1 7 2.5C17 12.5 10 17 10 17Z"
      fill={filled ? "#7d543c" : "none"}
      stroke={filled ? "#7d543c" : "#8c6e63"}
      strokeWidth="1.5"
    />
  </svg>
);

export function EventCard({ event, onClick, onLike, shadow = true }: EventCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={event.title}
      className={`bg-white rounded-[20px] w-full overflow-hidden cursor-pointer shrink-0 text-left ${shadow ? "shadow-[0px_4px_20px_0px_rgba(63,42,36,0.1)]" : ""}`}
    >
      <div className="relative h-[192px] w-full">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#d9cfc5]" aria-hidden="true" />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[rgba(30,20,14,0.45)] to-transparent" aria-hidden="true" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <CategoryBadge category={event.category} />
          <DDayBadge days={event.dDay} />
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onLike?.(); }}
          aria-label={event.liked ? "좋아요 취소" : "좋아요"}
          aria-pressed={event.liked}
          className="absolute top-3 right-3 bg-[rgba(240,228,212,0.85)] rounded-[14px] size-8 flex items-center justify-center"
        >
          <HeartIcon filled={event.liked} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 px-4 pt-3 pb-4">
        <p className="font-bold text-[15px] text-[#251e19] leading-[22px] truncate">
          {event.title}
        </p>
        <div className={metaRowClass}>
          <PinIcon />
          <span className="text-[11px] text-[#8c6e63] leading-[18px] truncate">
            {event.venue}
          </span>
        </div>
        <div className={metaRowClass}>
          <CalendarIcon />
          <span className="text-[11px] text-[#bf8b6e] leading-[17px]">
            {event.period}
          </span>
        </div>
      </div>
    </button>
  );
}
