'use client';

interface InputProps {
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function Input({ placeholder, type = "text", value, onChange, className }: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`bg-white border border-[#e2e2e2] rounded-[12px] h-[56px] w-full px-[21px] text-[14px] text-[#3f2a24] placeholder:text-[rgba(107,103,99,0.5)] outline-none focus:border-[#8edfd2] transition-colors ${className ?? ""}`}
    />
  );
}
