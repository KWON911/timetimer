"use client";

import { KTimerItem } from "@/lib/types";
import { BottomCircleButton } from "./BottomCircleButton";
import {
  LockClosedIcon,
  LockOpenIcon,
  MinusIcon,
  PlusIcon,
  ResetIcon,
  SpeakerOffIcon,
  SpeakerOnIcon,
} from "./icons";

interface BottomControlsProps {
  timer: KTimerItem;
  onChangeMinutes: (delta: number) => void;
  onReset: () => void;
  onToggleLock: () => void;
  onOpenAlarmSettings: () => void;
  layout?: "row" | "column";
}

export function BottomControls({
  timer,
  onChangeMinutes,
  onReset,
  onToggleLock,
  onOpenAlarmSettings,
  layout = "row",
}: BottomControlsProps) {
  const isColumn = layout === "column";

  return (
    <div
      className={
        isColumn
          ? "flex flex-col items-center gap-[10px]"
          : "mx-auto flex w-full max-w-lg items-center justify-between px-[30px] pb-[25px]"
      }
    >
      <div
        className={
          isColumn
            ? "flex flex-col items-center gap-[6px] rounded-[16px] bg-white px-[8px] py-[6px] font-semibold text-black shadow-[0_2px_6px_rgba(0,0,0,0.13)]"
            : "flex h-[46px] items-center gap-[14px] rounded-full bg-white px-[17px] font-semibold text-black shadow-[0_2px_6px_rgba(0,0,0,0.13)]"
        }
      >
        <button
          type="button"
          onClick={() => onChangeMinutes(-1)}
          aria-label="1분 감소"
          className="transition-opacity hover:opacity-50"
        >
          <MinusIcon width={isColumn ? 14 : 17} height={isColumn ? 14 : 17} />
        </button>

        <div className={isColumn ? "h-px w-[16px] bg-gray-300" : "h-[18px] w-px bg-gray-300"} />

        <button
          type="button"
          onClick={() => onChangeMinutes(1)}
          aria-label="1분 증가"
          className="transition-opacity hover:opacity-50"
        >
          <PlusIcon width={isColumn ? 14 : 17} height={isColumn ? 14 : 17} />
        </button>
      </div>

      <BottomCircleButton ariaLabel="리셋" onClick={onReset} compact={isColumn}>
        <ResetIcon width={17} height={17} />
      </BottomCircleButton>

      <BottomCircleButton
        ariaLabel={timer.isLocked ? "잠금 해제" : "잠금"}
        onClick={onToggleLock}
        compact={isColumn}
      >
        {timer.isLocked ? (
          <LockClosedIcon width={17} height={17} />
        ) : (
          <LockOpenIcon width={17} height={17} />
        )}
      </BottomCircleButton>

      <BottomCircleButton ariaLabel="알림 설정" onClick={onOpenAlarmSettings} compact={isColumn}>
        {timer.soundEnabled ? (
          <SpeakerOnIcon width={17} height={17} />
        ) : (
          <SpeakerOffIcon width={17} height={17} />
        )}
      </BottomCircleButton>
    </div>
  );
}
