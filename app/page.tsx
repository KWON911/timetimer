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

// 다이얼과 재생 버튼 사이의 고정 간격. 두 요소를 한 덩어리로 묶어
// 남는 공간 안에서 함께 중앙 정렬되도록 크기 계산에도 반영한다.
const DIAL_GROUP_GAP = 20;

// 남는 세로/가로 공간 중 더 작은 쪽에 맞춰 정사각형 다이얼 크기를 계산.
// 재생 버튼이 박스 안에 함께 들어있는 경우, 버튼이 차지하는 높이만큼
// 미리 빼서 다이얼+버튼 세트가 항상 박스 안에 딱 들어맞게 한다.
// 고정 수치 없이 실제 레이아웃 결과로 정확히 대응한다.
function useSquareFit() {
  const boxRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const button = buttonRef.current;
    if (!box || !button) return;

    const measure = () => {
      const boxRect = box.getBoundingClientRect();
      const isButtonVisible = getComputedStyle(button).display !== "none";
      const reserved = isButtonVisible
        ? button.getBoundingClientRect().height + DIAL_GROUP_GAP
        : 0;

      setSize(Math.max(0, Math.min(boxRect.width, boxRect.height - reserved)));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(button);

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

  return [boxRef, buttonRef, size] as const;
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

  const [squareBoxRef, playButtonRef, squareSize] = useSquareFit();

  if (!currentTimer) {
    return null;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <TopBar
        timerName={currentTimer.name}
        onOpenList={() => setShowTimerList(true)}
        onAddTimer={() => setShowAddTimer(true)}
      />

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-4 pt-1 pb-8 short-landscape:flex-row short-landscape:items-stretch short-landscape:gap-3 short-landscape:px-3 short-landscape:py-2">
        <div className="hidden shrink-0 short-landscape:flex short-landscape:flex-col short-landscape:items-center short-landscape:justify-center">
          <BottomControls
            timer={currentTimer}
            onChangeMinutes={changeMinutes}
            onReset={resetTimer}
            onToggleLock={toggleLock}
            onOpenAlarmSettings={() => setShowAlarmSettings(true)}
            layout="column"
          />
        </div>

        <div
          ref={squareBoxRef}
          className="flex min-h-0 w-full max-w-[1100px] flex-1 flex-col items-center justify-center gap-5"
        >
          <div
            className="relative shrink-0"
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

          <div ref={playButtonRef} className="shrink-0 short-landscape:hidden">
            <PlayTimeButton
              isRunning={isRunning}
              remainingLabel={formatTime(currentTimer.remainingSeconds)}
              onToggle={toggleTimer}
            />
          </div>
        </div>

        <div className="hidden shrink-0 short-landscape:flex short-landscape:flex-col short-landscape:items-center short-landscape:justify-center">
          <PlayTimeButton
            isRunning={isRunning}
            remainingLabel={formatTime(currentTimer.remainingSeconds)}
            onToggle={toggleTimer}
            layout="column"
          />
        </div>
      </div>

      <div className="short-landscape:hidden">
        <BottomControls
          timer={currentTimer}
          onChangeMinutes={changeMinutes}
          onReset={resetTimer}
          onToggleLock={toggleLock}
          onOpenAlarmSettings={() => setShowAlarmSettings(true)}
        />
      </div>

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
