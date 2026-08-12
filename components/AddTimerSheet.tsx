"use client";

import { useState } from "react";
import { TIMER_COLORS, TimerColor, TIMER_COLOR_HEX, createTimer } from "@/lib/types";
import { Sheet } from "./Sheet";
import { CheckIcon, MinusIcon, PlusIcon } from "./icons";

interface AddTimerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (timer: ReturnType<typeof createTimer>) => void;
}

export function AddTimerSheet({ isOpen, onClose, onAdd }: AddTimerSheetProps) {
  const [name, setName] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [color, setColor] = useState<TimerColor>("red");

  const reset = () => {
    setName("");
    setMinutes(30);
    setColor("red");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAdd = () => {
    const trimmed = name.trim();
    const finalName = trimmed.length > 0 ? trimmed : `${minutes}분 타이머`;

    onAdd(createTimer({ name: finalName, durationMinutes: minutes, color }));
    reset();
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={handleClose}>
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <button
          type="button"
          onClick={handleClose}
          className="text-sm text-black transition-opacity hover:opacity-60"
        >
          취소
        </button>
        <h2 className="text-base font-semibold text-black">새 타이머</h2>
        <button
          type="button"
          onClick={handleAdd}
          className="text-sm font-semibold text-black transition-opacity hover:opacity-60"
        >
          추가
        </button>
      </div>

      <div className="flex flex-col gap-6 px-5 py-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            타이머 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 독서 시간"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-black outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            시간
          </label>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMinutes((m) => Math.max(1, m - 1))}
              aria-label="1분 감소"
              className="rounded-full p-1 text-black transition-colors hover:bg-gray-100"
            >
              <MinusIcon width={22} height={22} />
            </button>

            <span className="text-xl font-semibold text-black">
              {minutes}분
            </span>

            <button
              type="button"
              onClick={() => setMinutes((m) => Math.min(60, m + 1))}
              aria-label="1분 증가"
              className="rounded-full p-1 text-black transition-colors hover:bg-gray-100"
            >
              <PlusIcon width={22} height={22} />
            </button>
          </div>

          <input
            type="range"
            min={1}
            max={60}
            step={1}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="mt-3 w-full accent-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            색상
          </label>

          <div className="flex flex-wrap gap-4">
            {TIMER_COLORS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setColor(option)}
                aria-label={option}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: TIMER_COLOR_HEX[option] }}
              >
                {color === option && (
                  <CheckIcon width={16} height={16} stroke="white" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
