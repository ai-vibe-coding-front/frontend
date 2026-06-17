'use client';

import Link from "next/link";
import { useState } from "react";
import { CTAButton } from "@/components/common/CTAButton";
import { Input } from "@/components/common/Input";

const headingClass = "font-bold text-[24px] text-[#1b1c19] tracking-[-1.2px] leading-[31.2px]";
const subtitleClass = "font-medium text-[16px] text-[#6b6763] leading-[24px]";
const tableCellLabelClass = "font-medium text-[12px] text-[rgba(107,103,99,0.7)] leading-[18px] w-[80px] shrink-0";
const tableCellValueClass = "font-normal text-[12px] text-[#3f2a24] leading-[18px]";

export default function SignupPage() {
  const [agreed, setAgreed] = useState(false);

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
            <p className={headingClass}>반가워요! 정보를 입력해주세요</p>
            <p className={subtitleClass}>MUUD와 함께 따뜻한 문화 여정을 시작하세요</p>
          </div>

          {/* 폼 */}
          <div className="flex flex-col gap-3">
            <Input placeholder="닉네임" />
            <Input placeholder="이메일" type="email" />
            <Input placeholder="비밀번호" type="password" />
            <Input placeholder="비밀번호 확인" type="password" />

            {/* 개인정보 수집동의 */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => setAgreed(!agreed)}
                className="flex items-center gap-[10px]"
              >
                <div className={`size-[18px] rounded-[5px] border shrink-0 flex items-center justify-center transition-colors ${agreed ? "bg-[#8edfd2] border-[#8edfd2]" : "bg-white border-[#e2e2e2]"}`}>
                  {agreed && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="#245b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] text-[rgba(35,39,47,0.45)] leading-[19.5px]">
                  (필수) 개인정보 수집동의
                </span>
              </button>

              {/* 개인정보 테이블 */}
              <div className="bg-white border border-[#e2e2e2] rounded-[10px] overflow-hidden">
                <div className="flex items-center px-[14px] py-[9px] border-b border-[#e2e2e2]">
                  <span className={tableCellLabelClass}>수집 항목</span>
                  <span className={tableCellValueClass}>이메일 주소</span>
                </div>
                <div className="flex items-center px-[14px] py-[9px] border-b border-[#e2e2e2]">
                  <span className={tableCellLabelClass}>수집 목적</span>
                  <span className={tableCellValueClass}>회원 식별, 로그인, 비밀번호 재설정</span>
                </div>
                <div className="flex items-center px-[14px] py-[9px]">
                  <span className={tableCellLabelClass}>보유 기간</span>
                  <span className={tableCellValueClass}>회원 탈퇴 시까지</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <CTAButton label="가입하기" />
            </div>
          </div>

          {/* 하단 링크 */}
          <div className="flex items-center justify-center gap-2 pt-10">
            <span className="text-[14px] text-[#6b6763] leading-[20px]">이미 계정이 있으신가요?</span>
            <Link href="/login" className="font-bold text-[14px] text-[#251e19] leading-[20px]">
              로그인
            </Link>
          </div>
        </div>
    </>
  );
}
