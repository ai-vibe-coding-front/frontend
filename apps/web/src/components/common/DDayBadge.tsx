import { twMerge } from "tailwind-merge";

interface DDayBadgeProps {
  days: number;
  className?: string;
}

export function DDayBadge({ days, className }: DDayBadgeProps) {
  return (
    <div className={twMerge("w-fit border border-[#f25c3a] bg-[#fefefe] flex items-center justify-center px-2 py-0.5 rounded-full", className)}>
      <span className="font-bold text-[11px] text-[#f25c3a] whitespace-nowrap leading-[16.5px]">
        D-{days}
      </span>
    </div>
  );
}
