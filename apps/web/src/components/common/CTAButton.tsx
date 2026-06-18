'use client';

import { twMerge } from "tailwind-merge";

interface CTAButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function CTAButton({ label, onClick, className, disabled }: CTAButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={twMerge("bg-[#8edfd2] w-full flex items-center justify-center px-[88px] py-3 rounded-2xl shadow-[0px_10px_12px_rgba(59,38,20,0.1)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity", className)}
    >
      <span className="font-semibold text-sm text-[#245b6b] leading-[21px] whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}
