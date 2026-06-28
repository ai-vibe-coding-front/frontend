import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface HeaderProps {
  title: string;
  /** 뒤로가기 클릭 시 이동할 경로. 미지정 시 router.back() 동작을 위해 onBackClick을 사용 */
  backHref?: string;
  onBackClick?: () => void;
  /** 지정 시 title을 클릭 가능한 링크로 렌더링 */
  titleHref?: string;
  rightSlot?: ReactNode;
  /** large: MUUD 워드마크용 24px, default: 20px */
  size?: "large" | "default";
}

function BackButton({
  backHref,
  onBackClick,
}: {
  backHref?: string;
  onBackClick?: () => void;
}) {
  const icon = (
    <Image
      src="/icons/back-arrow.svg"
      alt="뒤로가기"
      width={16}
      height={16}
      className="size-full"
    />
  );

  if (backHref) {
    return (
      <Link href={backHref} className="size-4 shrink-0">
        {icon}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onBackClick} className="size-4 shrink-0">
      {icon}
    </button>
  );
}

export function Header({
  title,
  backHref,
  onBackClick,
  titleHref,
  rightSlot,
  size = "default",
}: HeaderProps) {
  const showBackButton = Boolean(backHref || onBackClick);

  const titleClass = `shrink-0 font-bold text-[#251e19] leading-[36px] ${size === "large" ? "text-[24px]" : "text-[20px]"}`;
  const titleEl = titleHref ? (
    <Link href={titleHref} className={titleClass}>
      {title}
    </Link>
  ) : (
    <p className={titleClass}>{title}</p>
  );

  return (
    <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] flex items-center px-6 shrink-0 z-10">
      <div className="flex-1 flex items-center">
        {showBackButton && (
          <BackButton backHref={backHref} onBackClick={onBackClick} />
        )}
      </div>
      {titleEl}
      <div className="flex-1 flex items-center justify-end">{rightSlot}</div>
    </div>
  );
}
