'use client';
import { CTAButton } from "@/components/common/CTAButton";

interface TodayMoodCardProps {
  isLoggedIn: boolean;
  userName?: string;
  onCTAClick?: () => void;
  onGuestClick?: () => void;
}

const titleClass = "font-bold text-2xl text-[#251e19] leading-[31px]";
const descClass = "font-medium text-[13px] text-[#4d4540] leading-[19px]";

export function TodayMoodCard({ isLoggedIn, userName, onCTAClick, onGuestClick }: TodayMoodCardProps) {
  return (
    <div className="bg-[#fefefe] rounded-[26px] shadow-[0px_10px_12px_rgba(59,38,20,0.1)] w-full">
      <div className="flex flex-col gap-3 p-4">
        <span className="font-bold text-[11px] text-[#7d543c] leading-[16.5px] tracking-wide">
          TODAY MOOD
        </span>

        {isLoggedIn ? (
          <>
            <p className={titleClass}>
              {userName}님, 오늘은<br />어떤 문화생활이 끌리나요?
            </p>
            <p className={descClass}>
              지금의 에너지와 분위기에 맞춰 전시, 공연, 축제를 골라드릴게요.
            </p>
            <CTAButton label="오늘의 무드로 추천받기" onClick={onCTAClick} />
          </>
        ) : (
          <>
            <p className={titleClass}>
              오늘의 기분으로<br />문화행사를 골라드려요
            </p>
            <p className={descClass}>
              무엇을 검색할지 정하지 않아도 괜찮아요. 기분과 상황을 고르면 나에게 맞는 행사를 추천합니다.
            </p>
            <CTAButton label="로그인하고 시작하기" onClick={onCTAClick} />
            <CTAButton label="로그인 없이 시작하기" onClick={onGuestClick} className="bg-transparent border border-[#8edfd2]" />
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7E756F]" />
              <p className="text-[12px] text-[#8c6e63] leading-[18px]">
                로그인 없이도 오늘의 추천을 1회 체험할 수 있어요
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
