"use client";

import { ReactNode } from "react";

interface BottomCircleButtonProps {
  onClick: () => void;
  children: ReactNode;
  ariaLabel: string;
  compact?: boolean;
}

export function BottomCircleButton({
  onClick,
  children,
  ariaLabel,
  compact = false,
}: BottomCircleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={
        compact
          ? "flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.13)] transition-transform hover:scale-105 hover:bg-gray-50 active:scale-95"
          : "flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.13)] transition-transform hover:scale-105 hover:bg-gray-50 active:scale-95"
      }
    >
      {children}
    </button>
  );
}
