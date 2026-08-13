"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { KTimerItem, createTimer } from "./types";
import {
  loadSelectedTimerId,
  loadTimers,
  saveSelectedTimerId,
  saveTimers,
} from "./storage";
import { AlarmPlayer } from "./alarmPlayer";

const DEFAULT_TIMERS: KTimerItem[] = [
  createTimer({ name: "30분 타이머", durationMinutes: 30, color: "red" }, "default-timer"),
];

export function useTimerEngine() {
  const [timers, setTimers] = useState<KTimerItem[]>(DEFAULT_TIMERS);
  const [selectedTimerId, setSelectedTimerId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const targetEndDateRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hydrated = useRef(false);

  const timersRef = useRef(timers);
  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  const [alarmPlayer] = useState(() =>
    typeof window !== "undefined" ? new AlarmPlayer() : null
  );
  const alarmPlayerRef = useRef(alarmPlayer);

  // 초기 로드 (localStorage는 클라이언트에서만 접근 가능하므로 마운트 후 동기화)
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const saved = loadTimers();
    const list = saved ?? DEFAULT_TIMERS;

    const savedSelected = loadSelectedTimerId();
    const validSelected =
      savedSelected && list.some((t) => t.id === savedSelected)
        ? savedSelected
        : list[0]?.id ?? null;

    setTimers(list);
    setSelectedTimerId(validSelected);
  }, []);

  useEffect(() => {
    if (hydrated.current && selectedTimerId) {
      saveSelectedTimerId(selectedTimerId);
    }
  }, [selectedTimerId]);

  const currentIndex = timers.findIndex((t) => t.id === selectedTimerId);
  const currentTimer =
    currentIndex >= 0 ? timers[currentIndex] : timers[0] ?? null;

  const updateCurrent = useCallback(
    (updater: (timer: KTimerItem) => KTimerItem) => {
      setTimers((prev) => {
        const index = prev.findIndex((t) => t.id === (selectedTimerId ?? prev[0]?.id));
        if (index < 0) return prev;

        const next = [...prev];
        next[index] = updater(next[index]);
        saveTimers(next);
        return next;
      });
    },
    [selectedTimerId]
  );

  const invalidateInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const finishTimer = useCallback(() => {
    invalidateInterval();
    targetEndDateRef.current = null;
    setIsRunning(false);

    setTimers((prev) => {
      const index = prev.findIndex((t) => t.id === (selectedTimerId ?? prev[0]?.id));
      if (index < 0) return prev;

      const next = [...prev];
      next[index] = { ...next[index], remainingSeconds: 0 };
      saveTimers(next);
      return next;
    });

    alarmPlayerRef.current?.stopKeepAlive();

    const finished = timersRef.current.find(
      (t) => t.id === (selectedTimerId ?? timersRef.current[0]?.id)
    );

    if (finished?.soundEnabled) {
      alarmPlayerRef.current?.play(
        finished.alarmSound,
        finished.alarmVolume,
        finished.alarmRepeatCount
      );

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(200);
      }
    }
  }, [invalidateInterval, selectedTimerId]);

  const synchronize = useCallback(() => {
    const endDate = targetEndDateRef.current;
    if (!isRunning || endDate === null) return;

    const remaining = Math.ceil((endDate - Date.now()) / 1000);

    if (remaining > 0) {
      setTimers((prev) => {
        const index = prev.findIndex((t) => t.id === (selectedTimerId ?? prev[0]?.id));
        if (index < 0) return prev;
        if (prev[index].remainingSeconds === remaining) return prev;

        const next = [...prev];
        next[index] = { ...next[index], remainingSeconds: remaining };
        return next;
      });
    } else {
      finishTimer();
    }
  }, [isRunning, selectedTimerId, finishTimer]);

  const startSystemTimer = useCallback(() => {
    invalidateInterval();
    intervalRef.current = setInterval(synchronize, 250);
  }, [invalidateInterval, synchronize]);

  // isRunning이 true가 될 때 인터벌 (re)시작 — synchronize가 최신 클로저를 참조하도록
  useEffect(() => {
    if (isRunning) {
      startSystemTimer();
    } else {
      invalidateInterval();
    }
    return invalidateInterval;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, synchronize]);

  const startTimer = useCallback(() => {
    if (!currentTimer || currentTimer.remainingSeconds <= 0) return;

    // iOS Safari suspends AudioContext until a user gesture unlocks it;
    // unlock here (inside the tap handler) so the later alarm playback
    // triggered by setInterval — with no gesture of its own — can still play.
    alarmPlayerRef.current?.initializeAudio();
    alarmPlayerRef.current?.stop();
    alarmPlayerRef.current?.startKeepAlive();
    targetEndDateRef.current = Date.now() + currentTimer.remainingSeconds * 1000;
    setIsRunning(true);
  }, [currentTimer]);

  const pauseTimer = useCallback(() => {
    synchronize();
    alarmPlayerRef.current?.stopKeepAlive();
    targetEndDateRef.current = null;
    setIsRunning(false);
  }, [synchronize]);

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isRunning, pauseTimer, startTimer]);

  const resetTimer = useCallback(() => {
    invalidateInterval();
    alarmPlayerRef.current?.stop();
    alarmPlayerRef.current?.stopKeepAlive();
    targetEndDateRef.current = null;
    setIsRunning(false);

    updateCurrent((t) => ({ ...t, remainingSeconds: t.durationMinutes * 60 }));
  }, [invalidateInterval, updateCurrent]);

  const stopCurrentTimer = useCallback(() => {
    if (isRunning) synchronize();
    invalidateInterval();
    alarmPlayerRef.current?.stop();
    alarmPlayerRef.current?.stopKeepAlive();
    targetEndDateRef.current = null;
    setIsRunning(false);
  }, [isRunning, synchronize, invalidateInterval]);

  const toggleLock = useCallback(() => {
    updateCurrent((t) => ({ ...t, isLocked: !t.isLocked }));
  }, [updateCurrent]);

  const changeMinutes = useCallback(
    (delta: number) => {
      if (isRunning || !currentTimer || currentTimer.isLocked) return;

      const newMinutes = Math.min(
        Math.max(currentTimer.durationMinutes + delta, 1),
        60
      );

      updateCurrent((t) => ({
        ...t,
        durationMinutes: newMinutes,
        remainingSeconds: newMinutes * 60,
      }));
    },
    [isRunning, currentTimer, updateCurrent]
  );

  const setMinutes = useCallback(
    (minutes: number) => {
      if (isRunning || !currentTimer || currentTimer.isLocked) return;

      const safeMinutes = Math.min(Math.max(minutes, 1), 60);

      updateCurrent((t) => ({
        ...t,
        durationMinutes: safeMinutes,
        remainingSeconds: safeMinutes * 60,
      }));
    },
    [isRunning, currentTimer, updateCurrent]
  );

  const updateAlarmSettings = useCallback(
    (settings: {
      enabled: boolean;
      sound: KTimerItem["alarmSound"];
      volume: number;
      repeatCount: number;
    }) => {
      updateCurrent((t) => ({
        ...t,
        soundEnabled: settings.enabled,
        alarmSound: settings.sound,
        alarmVolume: settings.volume,
        alarmRepeatCount: settings.repeatCount,
      }));
    },
    [updateCurrent]
  );

  const addTimer = useCallback(
    (timer: KTimerItem) => {
      stopCurrentTimer();
      setTimers((prev) => {
        const next = [...prev, timer];
        saveTimers(next);
        return next;
      });
      setSelectedTimerId(timer.id);
    },
    [stopCurrentTimer]
  );

  const selectTimer = useCallback(
    (id: string) => {
      if (id === selectedTimerId) return;
      stopCurrentTimer();
      setSelectedTimerId(id);
    },
    [selectedTimerId, stopCurrentTimer]
  );

  const deleteTimer = useCallback(
    (id: string) => {
      if (timersRef.current.length <= 1) return;

      const deletingCurrent = selectedTimerId === id;
      if (deletingCurrent) stopCurrentTimer();

      const next = timersRef.current.filter((t) => t.id !== id);
      saveTimers(next);
      setTimers(next);

      if (deletingCurrent) {
        setSelectedTimerId(next[0]?.id ?? null);
      }
    },
    [selectedTimerId, stopCurrentTimer]
  );

  return {
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
  };
}
