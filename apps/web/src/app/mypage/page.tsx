import { BottomNav } from '@/components/layout/BottomNav';


const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4l4 4-4 4" stroke="#3f2a24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SavedHeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 17S3 12.5 3 7.5A4 4 0 0 1 10 5a4 4 0 0 1 7 2.5C17 12.5 10 17 10 17Z"
      fill="#7d543c"
      stroke="#7d543c"
      strokeWidth="1.5"
    />
  </svg>
);

export default function MyPage() {
  return (
    <div className="bg-[#f0ebe3] min-h-screen flex items-center justify-center">
      <div className="bg-[rgba(251,249,244,0.95)] w-[390px] min-h-screen shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)] flex flex-col">

        {/* Header */}
        <div className="bg-[#faf7f2] h-[56px] flex items-center justify-between px-5 shrink-0">
          <button className="size-10 flex items-center justify-center rounded-full">
            <img src="/icons/back-arrow.svg" alt="뒤로가기" className="size-4" />
          </button>
          <p className="font-bold text-[20px] text-[#251e19] leading-[28px] tracking-[-0.5px]">
            마이페이지
          </p>
          <div className="size-10" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-6 items-center px-5 pt-3 pb-6 overflow-y-auto">

          {/* 프로필 카드 */}
          <div className="bg-[#fefefe] shadow-[0px_2px_6px_0px_rgba(63,42,36,0.06)] rounded-[32px] w-[350px] flex flex-col items-center justify-center p-6 gap-1">
            <p className="font-bold text-[22px] text-[#251e19] leading-[30px] tracking-[-0.3px]">
              무드유저
            </p>
            <p className="font-normal text-[14px] text-[#8c6e63] leading-[20px] tracking-[0.14px]">
              user@example.com
            </p>
          </div>

          {/* 저장한 관심 행사 카드 */}
          <div className="bg-[#fefefe] shadow-[0px_2px_6px_0px_rgba(63,42,36,0.06)] rounded-[32px] w-[350px]">
            <button className="w-full flex items-center gap-4 p-6">
              <div className="bg-[#f0e4d4] rounded-full size-12 flex items-center justify-center shrink-0">
                <SavedHeartIcon />
              </div>
              <div className="flex flex-col gap-1 flex-1 items-start">
                <p className="font-medium text-[14px] text-[#716456] leading-[20px] tracking-[0.28px]">
                  저장한 관심 행사
                </p>
                <p className="font-bold text-[20px] text-[#251e19] leading-[28px] tracking-[-0.2px]">
                  5개
                </p>
              </div>
              <ChevronRightIcon />
            </button>
          </div>

          {/* 로그아웃 */}
          <div className="flex items-center justify-center py-2">
            <button className="font-medium text-[14px] text-[#8c6e63] leading-[20px] tracking-[0.28px] underline underline-offset-2">
              로그아웃
            </button>
          </div>
        </div>

        {/* BottomNav */}
        <div className="shrink-0">
          <BottomNav activeTab="my" />
        </div>
      </div>
    </div>
  );
}
