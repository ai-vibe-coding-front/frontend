interface HeaderProps {
  userName?: string;
}

export function Header({ userName }: HeaderProps) {
  return (
    <div className="flex items-start justify-between w-full">
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-[26px] text-[#251e19] leading-normal">
          MUUD
        </span>
        <span className="font-medium text-xs text-[#716456] leading-[18px]">
          오늘의 문화생활 대시보드
        </span>
      </div>
    </div>
  );
}
