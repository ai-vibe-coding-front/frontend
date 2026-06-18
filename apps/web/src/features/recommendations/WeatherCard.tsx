interface WeatherCardProps {
  location?: string;
  weather?: string;
  temperature?: number;
  title?: string;
  subtitle?: string;
}

export function WeatherCard({
  location = "성수동",
  weather = "맑음",
  temperature = 22,
  title = "따뜻한 햇살이 드는 날",
  subtitle = "이런 날, 어디 가볼까요?",
}: WeatherCardProps) {
  return (
    <div className="bg-[rgba(142,223,210,0.4)] rounded-[26px] shadow-[0px_4px_16px_0px_rgba(59,38,20,0.1)] w-full">
      <div className="flex items-center gap-[14px] p-4 min-h-[96px]">
        <div className="bg-[#fdf0d5] rounded-full size-16 flex items-center justify-center shrink-0">
          <img src="/icons/sun.svg" alt="날씨" className="size-10" />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p className="font-medium text-[12px] text-[#716456] leading-[18px]">
            오늘 {location} · {weather} {temperature}°C
          </p>
          <p className="font-bold text-[20px] text-[#251e19] leading-[27px]">
            {title}
          </p>
          <p className="font-medium text-[13px] text-[#4d4540] leading-[19px]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
