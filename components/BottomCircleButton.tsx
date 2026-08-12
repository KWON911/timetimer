"use client";

import { ReactNode } from "react";

interface BottomCircleButtonProps {
  onClick: () => void;
  children: ReactNode;
  ariaLabel: string;
}

export function BottomCircleButton({
  onClick,
  children,
  ariaLabel,
}: BottomCircleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.13)] transition-transform hover:scale-105 hover:bg-gray-50 active:scale-95 short-landscape:h-[32px] short-landscape:w-[32px]"
    >
      {children}
    </button>
  );
}
