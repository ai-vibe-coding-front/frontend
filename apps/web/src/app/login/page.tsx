'use client';

import Link from "next/link";
import { CTAButton } from "@/components/common/CTAButton";
import { Input } from "@/components/common/Input";

const headingClass = "font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[31.2px]";
const subtitleClass = "font-medium text-[16px] text-[#6b6763] leading-[22.4px]";
const dividerClass = "bg-[#e2e2e2] h-px flex-1";

export default function LoginPage() {
  return (
    <>

        {/* TopAppBar */}
        <div className="backdrop-blur-[6px] bg-[rgba(251,249,244,0.95)] h-[64px] flex items-center justify-center shrink-0">
          <p className="font-bold text-[24px] text-[#251e19] tracking-[-1.2px] leading-[36px]">MUUD</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col px-6 py-3">

          {/* 헤딩 */}
          <div className="flex flex-col gap-[11px] pb-6">
            <p className={headingClass}>다시 만나 반가워요</p>
            <p className={subtitleClass}>이메일로 로그인하고 추천을 이어가세요</p>
          </div>

          {/* 폼 */}
          <div className="flex flex-col gap-3">
            <Input placeholder="이메일" type="email" />
            <Input placeholder="비밀번호" type="password" />

            <div className="flex justify-end pt-1">
              <button className="text-[14px] text-[#6b6763] leading-[20px]">
                비밀번호를 잊으셨나요?
              </button>
            </div>

            <div className="pt-6">
              <CTAButton label="로그인" />
            </div>
          </div>

          {/* 하단 링크 및 OR 구분선 */}
          <div className="flex flex-col items-center gap-3 pt-10">
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#6b6763] leading-[20px]">아직 계정이 없나요?</span>
              <Link href="/signup" className="font-bold text-[14px] text-[#251e19] leading-[20px]">
                회원가입
              </Link>
            </div>

            <div className="flex items-center gap-4 w-full py-4">
              <div className={dividerClass} />
              <span className="text-[12px] text-[#6b6763] tracking-[1.2px] uppercase leading-[16px]">OR</span>
              <div className={dividerClass} />
            </div>

            <CTAButton
              label="로그인 없이 시작하기"
              className="bg-transparent border border-[#8edfd2]"
            />
          </div>
        </div>
    </>
  );
}
