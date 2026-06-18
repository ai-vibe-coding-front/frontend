'use client';

import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps {
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, type = "text", value, onChange, className }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={twMerge("bg-white border border-[#e2e2e2] rounded-[12px] h-[56px] w-full px-[21px] text-[14px] text-[#3f2a24] placeholder:text-[rgba(107,103,99,0.5)] outline-none focus:border-[#8edfd2] transition-colors", className)}
      />
    );
  }
);

Input.displayName = "Input";
