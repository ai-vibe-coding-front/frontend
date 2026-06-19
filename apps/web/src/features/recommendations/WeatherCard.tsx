import Image from "next/image";

type WeatherType = "sunny" | "cloudy" | "rainy" | "snowy";

const WEATHER_CONFIG: Record<
  WeatherType,
  { label: string; icon: string; iconBg: string; defaultTitle: string }
> = {
  sunny: {
    label: "맑음",
    icon: "/icons/sun.svg",
    iconBg: "bg-[#fdf0d5]",
    defaultTitle: "따뜻한 햇살이 드는 날",
  },
  cloudy: {
    label: "흐림",
    icon: "/icons/cloud.svg",
    iconBg: "bg-[#e8edf2]",
    defaultTitle: "구름 사이로 걷기 좋은 날",
  },
  rainy: {
    label: "비",
    icon: "/icons/rain.svg",
    iconBg: "bg-[#dde6ee]",
    defaultTitle: "비 오는 날엔 실내가 좋아요",
  },
  snowy: {
    label: "눈",
    icon: "/icons/snow.svg",
    iconBg: "bg-[#e4ebf0]",
    defaultTitle: "눈 내리는 날의 따뜻한 공간",
  },
};

const cardWrapper = "bg-[rgba(142,223,210,0.4)] rounded-[26px] shadow-[0px_4px_16px_0px_rgba(59,38,20,0.1)] w-full";
const cardInner = "flex items-center gap-[14px] p-4 min-h-[96px]";

interface WeatherCardProps {
  location?: string;
  weather?: WeatherType;
  temperature?: number;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  isError?: boolean;
}

export function WeatherCard({
  location,
  weather = "sunny",
  temperature,
  title,
  subtitle = "이런 날, 어디 가볼까요?",
  isLoading = false,
  isError = false,
}: WeatherCardProps) {
  if (isLoading) {
    return (
      <div className={cardWrapper}>
        <div className={cardInner}>
          <div className="bg-[rgba(59,130,120,0.18)] rounded-full size-16 shrink-0 animate-pulse" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="bg-[rgba(59,130,120,0.18)] rounded h-[14px] w-24 animate-pulse [animation-delay:150ms]" />
            <div className="bg-[rgba(59,130,120,0.18)] rounded h-[22px] w-40 animate-pulse [animation-delay:300ms]" />
            <div className="bg-[rgba(59,130,120,0.18)] rounded h-[14px] w-28 animate-pulse [animation-delay:450ms]" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !location || temperature === undefined) {
    return (
      <div className={cardWrapper}>
        <div className={cardInner}>
          <div className="bg-[#f5ede0] rounded-full size-16 flex items-center justify-center shrink-0">
            <Image src="/icons/AlertTriangle.svg" alt="오류" width={28} height={28} />
          </div>
          <p className="font-medium text-[18px] text-[#716456] leading-[19px]">
            날씨 정보를 불러오지 못했어요
          </p>
        </div>
      </div>
    );
  }

  const config = WEATHER_CONFIG[weather];

  return (
    <div className={cardWrapper}>
      <div className={cardInner}>
        <div className={`${config.iconBg} rounded-full size-16 flex items-center justify-center shrink-0`}>
          <Image src={config.icon} alt={config.label} width={40} height={40} />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p className="font-medium text-[12px] text-[#716456] leading-[18px]">
            오늘 {location} · {config.label} {temperature}°C
          </p>
          <p className="font-bold text-[20px] text-[#251e19] leading-[27px]">
            {title ?? config.defaultTitle}
          </p>
          <p className="font-medium text-[13px] text-[#716456] leading-[19px]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
