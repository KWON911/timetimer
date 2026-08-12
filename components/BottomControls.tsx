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
}

export function BottomControls({
  timer,
  onChangeMinutes,
  onReset,
  onToggleLock,
  onOpenAlarmSettings,
}: BottomControlsProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg items-center justify-between px-[30px] pb-[25px] short-landscape:pb-[8px]">
      <div className="flex h-[46px] items-center gap-[14px] rounded-full bg-white px-[17px] font-semibold text-black shadow-[0_2px_6px_rgba(0,0,0,0.13)] short-landscape:h-[32px] short-landscape:gap-[10px] short-landscape:px-[12px]">
        <button
          type="button"
          onClick={() => onChangeMinutes(-1)}
          aria-label="1분 감소"
          className="transition-opacity hover:opacity-50"
        >
          <MinusIcon width={17} height={17} />
        </button>

        <div className="h-[18px] w-px bg-gray-300" />

        <button
          type="button"
          onClick={() => onChangeMinutes(1)}
          aria-label="1분 증가"
          className="transition-opacity hover:opacity-50"
        >
          <PlusIcon width={17} height={17} />
        </button>
      </div>

      <BottomCircleButton ariaLabel="리셋" onClick={onReset}>
        <ResetIcon width={17} height={17} />
      </BottomCircleButton>

      <BottomCircleButton
        ariaLabel={timer.isLocked ? "잠금 해제" : "잠금"}
        onClick={onToggleLock}
      >
        {timer.isLocked ? (
          <LockClosedIcon width={17} height={17} />
        ) : (
          <LockOpenIcon width={17} height={17} />
        )}
      </BottomCircleButton>

      <BottomCircleButton ariaLabel="알림 설정" onClick={onOpenAlarmSettings}>
        {timer.soundEnabled ? (
          <SpeakerOnIcon width={17} height={17} />
        ) : (
          <SpeakerOffIcon width={17} height={17} />
        )}
      </BottomCircleButton>
    </div>
  );
}
