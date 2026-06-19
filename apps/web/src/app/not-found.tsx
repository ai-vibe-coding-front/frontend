'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CTAButton } from '@/components/common/CTAButton';

const fourTextClass = 'font-bold text-[64px] leading-[64px] text-[#b89e8a] tracking-[-2px]';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="bg-[#f0ebe3] h-screen flex items-center justify-center">
      <div className="bg-[#f9f4ec] w-[390px] h-screen shadow-[0px_16px_18px_0px_rgba(51,31,15,0.18)] flex flex-col items-center justify-center px-6">

        {/* 일러스트 영역 */}
        <div className="relative flex items-center justify-center w-[220px] h-[180px]">
          <div className="absolute bg-[#e9dfd0] opacity-50 rounded-full size-[160px] top-[10px] left-[30px]" />
          <div className="absolute bg-[#dcd0c2] opacity-60 rounded-full size-[110px] top-[35px] left-[55px]" />
          <div className="absolute left-[44.71px] top-[58px]">
            <p className={fourTextClass}>4</p>
          </div>
          <div className="absolute left-[88px] top-[61px] flex items-center justify-center w-[44px] h-[52px]">
            <Image src="/icons/not-found-illustration.svg" alt="" width={44} height={52} />
          </div>
          <div className="absolute left-[134px] top-[58px]">
            <p className={fourTextClass}>4</p>
          </div>
          <div className="absolute bg-[#8edfd2] opacity-60 rounded-full size-[8px] top-[43px] left-[-25px]" />
          <div className="absolute bg-[#bf8b6e] opacity-50 rounded-full size-[5px] top-[73px] left-[228px]" />
          <div className="absolute bg-[#e4d8c9] rounded-full size-[6px] top-[13px] left-[249px]" />
        </div>

        {/* 텍스트 영역 */}
        <div className="flex flex-col items-center gap-[10px] pt-[8px]">
          <p className="font-bold text-[22px] text-[#251e19] leading-[32px] text-center">
            페이지를 찾을 수 없어요
          </p>
          <p className="font-medium text-[13px] text-[#716456] leading-[20px] text-center">
            주소가 잘못됐거나 삭제된 페이지예요
          </p>
        </div>

        {/* ERROR 404 배지 */}
        <div className="mt-[8px] bg-[#f0e9df] rounded-full px-[12px] py-[4px]">
          <p className="font-bold text-[11px] text-[#7d543c] tracking-[0.5px]">ERROR 404</p>
        </div>

        {/* CTA 버튼 */}
        <div className="mt-[28px] w-full">
          <CTAButton label="홈으로 돌아가기" onClick={() => router.push('/')} />
        </div>
      </div>
    </div>
  );
}
