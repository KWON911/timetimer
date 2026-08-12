"use client";

import { PauseIcon, PlayIcon } from "./icons";

interface PlayTimeButtonProps {
  isRunning: boolean;
  remainingLabel: string;
  onToggle: () => void;
}

export function PlayTimeButton({
  isRunning,
  remainingLabel,
  onToggle,
}: PlayTimeButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isRunning ? "일시정지" : "시작"}
      className="flex items-center gap-4 rounded-full bg-white px-10 py-5 shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition-transform hover:scale-105 hover:bg-gray-50 active:scale-95 short-landscape:gap-2 short-landscape:px-5 short-landscape:py-2"
    >
      {isRunning ? (
        <PauseIcon width={34} height={34} className="text-black short-landscape:h-5 short-landscape:w-5" />
      ) : (
        <PlayIcon width={34} height={34} className="translate-x-[2px] text-black short-landscape:h-5 short-landscape:w-5" />
      )}

      <span
        className="text-5xl font-bold text-black short-landscape:text-2xl"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {remainingLabel}
      </span>
    </button>
  );
}
