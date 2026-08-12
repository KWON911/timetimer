"use client";

import { useState } from "react";
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

  if (!currentTimer) {
    return null;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <TopBar
        onOpenList={() => setShowTimerList(true)}
        onAddTimer={() => setShowAddTimer(true)}
      />

      <div className="flex flex-1 items-center justify-center px-4">
        <div
          className="relative aspect-square"
          style={{
            width: "min(96vw, calc(100dvh - 21.5rem), 1100px)",
          }}
        >
          <h1 className="absolute bottom-full left-1/2 max-w-full -translate-x-1/2 truncate pb-1 text-4xl font-semibold leading-none text-black sm:text-6xl lg:text-7xl">
            {currentTimer.name}
          </h1>

          <VisualTimer
            remainingSeconds={currentTimer.remainingSeconds}
            color={currentTimer.color}
            isLocked={currentTimer.isLocked}
            isRunning={isRunning}
            onMinutesChanged={setMinutes}
          />

          <div className="absolute left-1/2 top-full -translate-x-1/2 pt-1">
            <PlayTimeButton
              isRunning={isRunning}
              remainingLabel={formatTime(currentTimer.remainingSeconds)}
              onToggle={toggleTimer}
            />
          </div>
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
