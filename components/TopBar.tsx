"use client";

import { MenuIcon, PlusIcon } from "./icons";

interface TopBarProps {
  timerName: string;
  onOpenList: () => void;
  onAddTimer: () => void;
}

export function TopBar({ timerName, onOpenList, onAddTimer }: TopBarProps) {
  return (
    <div className="relative flex items-center justify-between px-[30px] pt-[10px]">
      <button
        type="button"
        onClick={onOpenList}
        aria-label="타이머 목록"
        className="text-black transition-opacity hover:opacity-60"
      >
        <MenuIcon width={23} height={23} />
      </button>

      <span className="pointer-events-none absolute inset-x-0 top-[10px] bottom-0 flex items-center justify-center truncate px-16 text-sm text-black">
        TIME <span className="font-bold">TIMER</span>
        <span className="truncate"> · {timerName}</span>
      </span>

      <button
        type="button"
        onClick={onAddTimer}
        aria-label="새 타이머"
        className="text-black transition-opacity hover:opacity-60"
      >
        <PlusIcon width={25} height={25} />
      </button>
    </div>
  );
}
