'use client';

interface CTAButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

export function CTAButton({ label, onClick, className }: CTAButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-[#8edfd2] w-full flex items-center justify-center px-[88px] py-3 rounded-2xl shadow-[0px_10px_12px_rgba(59,38,20,0.1)] ${className ?? ""}`}
    >
      <span className="font-semibold text-sm text-[#245b6b] leading-[21px] whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}
