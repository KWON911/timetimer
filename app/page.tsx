"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useTimerEngine } from "@/lib/useTimerEngine";
import { AlarmPlayer } from "@/lib/alarmPlayer";
import { TopBar } from "@/components/TopBar";
import { VisualTimer } from "@/components/VisualTimer";
import { PlayTimeButton } from "@/components/PlayTimeButton";
import { BottomControls } from "@/components/BottomControls";
import { TimerListSheet } from "@/components/TimerListSheet";
import { AddTimerSheet } from "@/components/AddTimerSheet";
import { AlarmSettingsSheet } from "@/components/AlarmSettingsSheet";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

let previewPlayer: AlarmPlayer | null = null;
function getPreviewPlayer() {
  if (!previewPlayer) previewPlayer = new AlarmPlayer();
  return previewPlayer;
}

// 남는 세로/가로 공간 중 더 작은 쪽에 맞춰 정사각형 다이얼 크기를 계산.
// 세로 모드처럼 높이가 넉넉한 경우와 가로 모드처럼 높이가 부족한 경우 모두
// 고정 수치 없이 실제 레이아웃 결과로 정확히 대응한다.
function useSquareFit() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize(Math.max(0, Math.min(rect.width, rect.height)));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);

    // 백그라운드로 전환됐다 돌아오는 경우 등, 숨겨진 동안 놓친 레이아웃
    // 변화를 다시 화면에 보일 때 한 번 더 확인한다.
    document.addEventListener("visibilitychange", measure);
    window.addEventListener("orientationchange", measure);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", measure);
      window.removeEventListener("orientationchange", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return [ref, size] as const;
}

export default function Home() {
  const {
    timers,
    currentTimer,
    selectedTimerId,
    isRunning,
    toggleTimer,
    resetTimer,
    toggleLock,
    changeMinutes,
    setMinutes,
    updateAlarmSettings,
    addTimer,
    selectTimer,
    deleteTimer,
  } = useTimerEngine();

  const [showTimerList, setShowTimerList] = useState(false);
  const [showAddTimer, setShowAddTimer] = useState(false);
  const [showAlarmSettings, setShowAlarmSettings] = useState(false);

  const [squareBoxRef, squareSize] = useSquareFit();

  if (!currentTimer) {
    return null;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <TopBar
        onOpenList={() => setShowTimerList(true)}
        onAddTimer={() => setShowAddTimer(true)}
      />

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-4 py-1">
        <h1 className="w-full max-w-[1100px] shrink-0 truncate text-center text-4xl font-semibold leading-none text-black sm:text-6xl lg:text-7xl short-landscape:text-2xl short-landscape:sm:text-2xl">
          {currentTimer.name}
        </h1>

        <div
          ref={squareBoxRef}
          className="min-h-0 w-full max-w-[1100px] flex-1"
        >
          <div
            className="relative mx-auto"
            style={{ width: squareSize, height: squareSize }}
          >
            <VisualTimer
              remainingSeconds={currentTimer.remainingSeconds}
              color={currentTimer.color}
              isLocked={currentTimer.isLocked}
              isRunning={isRunning}
              onMinutesChanged={setMinutes}
            />
          </div>
        </div>

        <div className="shrink-0">
          <PlayTimeButton
            isRunning={isRunning}
            remainingLabel={formatTime(currentTimer.remainingSeconds)}
            onToggle={toggleTimer}
          />
        </div>
      </div>

      <BottomControls
        timer={currentTimer}
        onChangeMinutes={changeMinutes}
        onReset={resetTimer}
        onToggleLock={toggleLock}
        onOpenAlarmSettings={() => setShowAlarmSettings(true)}
      />

      <TimerListSheet
        isOpen={showTimerList}
        timers={timers}
        selectedTimerId={selectedTimerId}
        onSelect={(id) => {
          selectTimer(id);
          setShowTimerList(false);
        }}
        onDelete={deleteTimer}
        onAdd={() => {
          setShowTimerList(false);
          setTimeout(() => setShowAddTimer(true), 150);
        }}
        onClose={() => setShowTimerList(false)}
      />

      <AddTimerSheet
        isOpen={showAddTimer}
        onClose={() => setShowAddTimer(false)}
        onAdd={addTimer}
      />

      <AlarmSettingsSheet
        key={`${currentTimer.id}-${showAlarmSettings}`}
        isOpen={showAlarmSettings}
        soundEnabled={currentTimer.soundEnabled}
        selectedSound={currentTimer.alarmSound}
        volume={currentTimer.alarmVolume}
        repeatCount={currentTimer.alarmRepeatCount}
        onPreview={(sound, volume) => getPreviewPlayer().preview(sound, volume)}
        onSave={updateAlarmSettings}
        onClose={() => setShowAlarmSettings(false)}
      />
    </div>
  );
}
