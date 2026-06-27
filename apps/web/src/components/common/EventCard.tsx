"use client";
import { memo, useState } from "react";
import Image from "next/image";
import {
  CategoryBadge,
  type Category,
} from "@/components/common/CategoryBadge";
import { DDayBadge } from "@/components/common/DDayBadge";

export interface EventCardData {
  id: string;
  title: string;
  realmName: string | null;
  place: string | null;
  startDate: Date | null;
  endDate: Date | null;
  imageUrl: string | null;
  isFavorite?: boolean;
}

function formatPeriod(startDate: Date | null, endDate: Date | null): string {
  const fmt = (d: Date) => {
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };
  if (startDate && endDate) return `${fmt(startDate)} – ${fmt(endDate)}`;
  if (startDate) return fmt(startDate);
  if (endDate) return fmt(endDate);
  return "";
}

const VALID_CATEGORIES = new Set<string>([
  "전시",
  "음악/콘서트",
  "행사/축제",
  "연극",
  "뮤지컬/오페라",
  "국악",
  "무용/발레",
  "아동/가족",
  "교육/체험",
]);

function normalizeCategory(realmName: string | null): Category | null {
  if (realmName && VALID_CATEGORIES.has(realmName))
    return realmName as Category;
  return null;
}

function calcDDay(endDate: Date | null): string {
  if (!endDate) return 'D-DAY';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const diff = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return '종료';
  if (diff === 0) return 'D-DAY';
  return `D-${diff}`;
}

interface EventCardProps {
  event: EventCardData;
  onClick?: (eventId: string) => void;
  onFavorite?: (eventId: string, isFavorite?: boolean) => void;
  /** overflow 컨테이너 안에서 사용할 때 그림자가 잘리므로 false로 전달 */
  shadow?: boolean;
  /** 찜 요청 처리 중일 때 좋아요 버튼 비활성화 */
  favoriteDisabled?: boolean;
}

const PinIcon = () => (
  <svg
    width="10"
    height="12"
    viewBox="0 0 10 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 1a3 3 0 0 1 3 3c0 2.25-3 6-3 6S2 6.25 2 4a3 3 0 0 1 3-3Z"
      stroke="#8c6e63"
      strokeWidth="1"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="10"
    height="11"
    viewBox="0 0 10 11"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="0.5"
      y="1.5"
      width="9"
      height="8"
      rx="1.5"
      stroke="#bf8b6e"
      strokeWidth="1"
    />
    <path
      d="M3 0.5v2M7 0.5v2M0.5 4.5h9"
      stroke="#bf8b6e"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const metaRowClass = "flex items-center gap-1";

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M10 17S3 12.5 3 7.5A4 4 0 0 1 10 5a4 4 0 0 1 7 2.5C17 12.5 10 17 10 17Z"
      fill={filled ? "#7d543c" : "none"}
      stroke={filled ? "#7d543c" : "#8c6e63"}
      strokeWidth="1.5"
    />
  </svg>
);

export const EventCard = memo(function EventCard({
  event,
  onClick,
  onFavorite,
  shadow = true,
  favoriteDisabled = false,
}: EventCardProps) {
  const category = normalizeCategory(event.realmName);
  const ddayLabel = event.endDate ? calcDDay(event.endDate) : null;
  const isEnded = ddayLabel === '종료';
  // imageUrl이 있어도 로드가 실패할 수 있으므로, 실패 시 기본 배경(#d9cfc5)으로 폴백
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(event.imageUrl) && !imageFailed;

  return (
    // 카드 전체를 클릭 가능하게 만들기 위해 div에 role="button"을 부여한 구조.
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(event.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(event.id);
        }
      }}
      aria-label={event.title}
      className={`bg-white rounded-[20px] w-full overflow-hidden cursor-pointer shrink-0 text-left ${shadow ? "shadow-[0px_4px_20px_0px_rgba(63,42,36,0.1)]" : ""}`}
    >
      {/* 썸네일 영역: 높이 고정(192px) + absolute 레이어로 이미지/배지/그라디언트를 쌓는 구조 */}
      <div className="relative h-[192px] w-full">
        {showImage ? (
          <Image
            src={event.imageUrl as string}
            alt={event.title}
            fill
            sizes="100vw"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          // imageUrl이 없거나 로드 실패한 경우 공통 placeholder 배경
          <div className="absolute inset-0 bg-[#d9cfc5]" aria-hidden="true" />
        )}
        {isEnded && (
          <div
            className="absolute top-0 left-0 right-0 h-7 bg-[rgba(0,0,0,0.72)] flex items-center justify-center z-10"
            aria-hidden="true"
          >
            <span className="text-white text-[12px]">행사 종료</span>
          </div>
        )}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[rgba(30,20,14,0.45)] to-transparent"
          aria-hidden="true"
        />
        {/* 카테고리/D-Day 배지. z-index 미지정 → 그라디언트(아래)보다는 위지만 좋아요 버튼(z-20)보다는 아래. 새 오버레이 추가 시 z 순서 주의 */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          {category && <CategoryBadge category={category} />}
          {ddayLabel && <DDayBadge label={ddayLabel} />}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFavorite?.(event.id, event.isFavorite); }}
          disabled={favoriteDisabled}
          aria-label={event.isFavorite ? "좋아요 취소" : "좋아요"}
          aria-pressed={event.isFavorite}
          className={`absolute top-3 right-3 z-20 ${event.isFavorite ? "bg-[rgba(240,228,212,0.85)]" : "bg-[rgba(255,255,255,0.85)]"} rounded-[14px] size-8 flex items-center justify-center`}
        >
          <HeartIcon filled={event.isFavorite} />
        </button>
      </div>

      {/* 텍스트 정보 영역: 제목 + 장소/기간 meta row */}
      <div className="flex flex-col gap-1.5 px-4 pt-3 pb-4">
        <p className="font-bold text-[15px] text-[#251e19] leading-[22px] truncate">
          {event.title}
        </p>
        <div className={metaRowClass}>
          <PinIcon />
          <span className="text-[11px] text-[#8c6e63] leading-[18px] truncate">
            {event.place ?? "-"}
          </span>
        </div>
        <div className={metaRowClass}>
          <CalendarIcon />
          <span className="text-[11px] text-[#bf8b6e] leading-[17px]">
            {formatPeriod(event.startDate, event.endDate)}
          </span>
        </div>
      </div>
    </div>
  );
},
(prev, next) =>
  prev.event.id === next.event.id &&
  prev.event.isFavorite === next.event.isFavorite &&
  prev.event.imageUrl === next.event.imageUrl &&
  prev.event.title === next.event.title &&
  prev.event.realmName === next.event.realmName &&
  prev.event.place === next.event.place &&
  prev.event.startDate === next.event.startDate &&
  prev.event.endDate === next.event.endDate &&
  prev.favoriteDisabled === next.favoriteDisabled &&
  prev.shadow === next.shadow,
);
