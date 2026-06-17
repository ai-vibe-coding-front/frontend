import { twMerge } from "tailwind-merge";

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

const CATEGORY_COLORS: Record<Category, string> = {
  전시:          "#8ecdf5",
  "음악/콘서트": "#9fa7d1",
  "행사/축제":   "#9fd1b8",
  연극:          "#f5c18e",
  "뮤지컬/오페라": "#c18ef5",
  국악:          "#f5e18e",
  "무용/발레":   "#f58ec1",
  "아동/가족":   "#8ef5c1",
  "교육/체험":   "#f5a08e",
};

interface CategoryBadgeProps {
  category: Category;
  size?: "default" | "large";
  className?: string;
}

const sizeClass = {
  default: { wrap: "px-[8px] py-[5px]", text: "text-[11px] leading-[11px]" },
  large:   { wrap: "px-3 py-[6px]", text: "text-[14px] leading-[14px]" },
};

export function CategoryBadge({ category, size = "default", className }: CategoryBadgeProps) {
  const bg = CATEGORY_COLORS[category] ?? "#e5e5e5";
  const { wrap, text } = sizeClass[size];
  return (
    <div
      className={twMerge(`inline-flex items-center justify-center ${wrap} rounded-full`, className)}
      style={{ backgroundColor: bg }}
    >
      <span className={`${text} text-[#3f2a24] font-normal whitespace-nowrap`}>
        {category}
      </span>
    </div>
  );
}
