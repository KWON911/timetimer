"use client";

import { ReactElement, useState } from "react";
import { ALARM_SOUNDS, ALARM_SOUND_INFO, AlarmSound } from "@/lib/types";
import { Sheet } from "./Sheet";
import { BellIcon, CheckIcon, MusicNoteIcon, PlayIcon, WaveformIcon } from "./icons";

const SOUND_ICONS: Record<AlarmSound, (props: { width: number; height: number }) => ReactElement> = {
  chime: MusicNoteIcon,
  bell: BellIcon,
  electronic: WaveformIcon,
};

const REPEAT_OPTIONS = [1, 3, 5];

interface AlarmSettingsSheetProps {
  isOpen: boolean;
  soundEnabled: boolean;
  selectedSound: AlarmSound;
  volume: number;
  repeatCount: number;
  onPreview: (sound: AlarmSound, volume: number) => void;
  onSave: (settings: {
    enabled: boolean;
    sound: AlarmSound;
    volume: number;
    repeatCount: number;
  }) => void;
  onClose: () => void;
}

export function AlarmSettingsSheet({
  isOpen,
  soundEnabled,
  selectedSound,
  volume,
  repeatCount,
  onPreview,
  onSave,
  onClose,
}: AlarmSettingsSheetProps) {
  const [enabled, setEnabled] = useState(soundEnabled);
  const [sound, setSound] = useState(selectedSound);
  const [vol, setVol] = useState(volume);
  const [repeat, setRepeat] = useState(repeatCount);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    onSave({ enabled, sound, volume: vol, repeatCount: repeat });
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
        <h2 className="text-base font-semibold text-black">알림 설정</h2>
        <button
          type="button"
          onClick={handleSave}
          className="text-sm font-semibold text-black transition-opacity hover:opacity-60"
        >
          완료
        </button>
      </div>

      <div className="flex flex-col gap-6 px-5 py-5">
        <label className="flex items-center justify-between">
          <span className="font-medium text-black">타이머 종료 알림</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-5 w-5 accent-black"
          />
        </label>

        <div className={enabled ? "" : "pointer-events-none opacity-40"}>
          <p className="mb-2 text-sm font-medium text-gray-600">알림음</p>

          <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-100">
            {ALARM_SOUNDS.map((option) => {
              const Icon = SOUND_ICONS[option];
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSound(option);
                    onPreview(option, vol);
                  }}
                  className="flex items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <Icon width={20} height={20} />
                  <span className="text-black">{ALARM_SOUND_INFO[option].title}</span>
                  <span className="flex-1" />
                  {sound === option && <CheckIcon width={18} height={18} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className={enabled ? "" : "pointer-events-none opacity-40"}>
          <p className="mb-2 text-sm font-medium text-gray-600">음량</p>
          <input
            type="range"
            min={0.1}
            max={1.0}
            step={0.01}
            value={vol}
            onChange={(e) => setVol(Number(e.target.value))}
            className="w-full accent-black"
          />
          <p className="mt-1 text-sm text-gray-500">{Math.round(vol * 100)}%</p>
        </div>

        <div className={enabled ? "" : "pointer-events-none opacity-40"}>
          <p className="mb-2 text-sm font-medium text-gray-600">반복</p>
          <div className="flex overflow-hidden rounded-lg border border-gray-200">
            {REPEAT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRepeat(option)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  repeat === option
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {option}회
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={!enabled}
          onClick={() => onPreview(sound, vol)}
          className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 font-semibold text-black transition-colors hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-gray-100"
        >
          <PlayIcon width={16} height={16} />
          미리 듣기
        </button>
      </div>
    </Sheet>
  );
}
