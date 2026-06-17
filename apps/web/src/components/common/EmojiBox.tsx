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

const CATEGORY_EMOJI: Record<Category, string> = {
  전시: "🖼️",
  "음악/콘서트": "🎤",
  "행사/축제": "🎪",
  연극: "🎭",
  "뮤지컬/오페라": "🎼",
  국악: "🥁",
  "무용/발레": "🩰",
  "아동/가족": "🧸",
  "교육/체험": "📚",
};

interface EmojiBoxProps {
  category: Category;
  className?: string;
}

export function EmojiBox({ category, className }: EmojiBoxProps) {
  return (
    <div
      className={`bg-[#f5ede0] flex items-center justify-center rounded-xl size-11 shrink-0 ${className ?? ""}`}
    >
      <span className="text-[18px] leading-[27px]">
        {CATEGORY_EMOJI[category] ?? "🎨"}
      </span>
    </div>
  );
}
