"use client";

import { PauseIcon, PlayIcon } from "./icons";

interface PlayTimeButtonProps {
  isRunning: boolean;
  remainingLabel: string;
  onToggle: () => void;
  layout?: "row" | "column";
}

export function PlayTimeButton({
  isRunning,
  remainingLabel,
  onToggle,
  layout = "row",
}: PlayTimeButtonProps) {
  if (layout === "column") {
    return (
      <div className="flex flex-col items-center gap-[10px]">
        <span
          className="text-lg font-bold text-black"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {remainingLabel}
        </span>

        <button
          type="button"
          onClick={onToggle}
          aria-label={isRunning ? "일시정지" : "시작"}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition-transform hover:scale-105 hover:bg-gray-50 active:scale-95"
        >
          {isRunning ? (
            <PauseIcon width={16} height={16} className="text-black" />
          ) : (
            <PlayIcon width={16} height={16} className="translate-x-[1px] text-black" />
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isRunning ? "일시정지" : "시작"}
      className="flex items-center gap-[clamp(0.5rem,2vw,1rem)] rounded-full bg-white px-[clamp(0.75rem,4vw,2.5rem)] py-[clamp(0.5rem,2.5vw,1.25rem)] shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition-transform hover:scale-105 hover:bg-gray-50 active:scale-95"
    >
      {isRunning ? (
        <PauseIcon width="clamp(18px,6vw,34px)" height="clamp(18px,6vw,34px)" className="text-black" />
      ) : (
        <PlayIcon
          width="clamp(18px,6vw,34px)"
          height="clamp(18px,6vw,34px)"
          className="translate-x-[2px] text-black"
        />
      )}

      <span
        className="text-[clamp(1.5rem,8vw,3rem)] font-bold text-black"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {remainingLabel}
      </span>
    </button>
  );
}
