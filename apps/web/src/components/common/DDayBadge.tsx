interface DDayBadgeProps {
  days: number;
  className?: string;
}

export function DDayBadge({ days, className }: DDayBadgeProps) {
  return (
    <div className={className}>
      <div className="border border-[#f25c3a] bg-[#fefefe] flex items-center justify-center px-2 py-0.5 rounded-full">
        <span className="font-bold text-[11px] text-[#f25c3a] whitespace-nowrap leading-[16.5px]">
          D-{days}
        </span>
      </div>
    </div>
  );
}
