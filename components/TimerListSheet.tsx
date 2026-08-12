"use client";

import { KTimerItem, TIMER_COLOR_HEX } from "@/lib/types";
import { Sheet } from "./Sheet";
import { CheckIcon, PlusIcon, TrashIcon } from "./icons";

interface TimerListSheetProps {
  isOpen: boolean;
  timers: KTimerItem[];
  selectedTimerId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onClose: () => void;
}

export function TimerListSheet({
  isOpen,
  timers,
  selectedTimerId,
  onSelect,
  onDelete,
  onAdd,
  onClose,
}: TimerListSheetProps) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-black transition-opacity hover:opacity-60"
        >
          닫기
        </button>
        <h2 className="text-base font-semibold text-black">타이머</h2>
        <button
          type="button"
          onClick={onAdd}
          aria-label="새 타이머"
          className="text-black transition-opacity hover:opacity-60"
        >
          <PlusIcon width={20} height={20} />
        </button>
      </div>

      <ul className="divide-y divide-gray-100">
        {timers.map((timer) => (
          <li key={timer.id} className="group flex items-center gap-3 px-5 py-3">
            <button
              type="button"
              onClick={() => onSelect(timer.id)}
              className="-mx-2 flex flex-1 items-center gap-3 rounded-lg px-2 py-1 text-left transition-colors hover:bg-gray-50"
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: TIMER_COLOR_HEX[timer.color] }}
              />

              <span className="flex flex-col">
                <span className="font-medium text-black">{timer.name}</span>
                <span className="text-sm text-gray-500">
                  {timer.durationMinutes}분
                </span>
              </span>

              <span className="flex-1" />

              {selectedTimerId === timer.id && (
                <CheckIcon width={18} height={18} />
              )}
            </button>

            {timers.length > 1 && (
              <button
                type="button"
                onClick={() => onDelete(timer.id)}
                aria-label="삭제"
                className="rounded-full p-1 text-red-500 transition-colors hover:bg-red-50"
              >
                <TrashIcon width={18} height={18} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
