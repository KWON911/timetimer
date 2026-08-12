import { KTimerItem } from "./types";

const SAVE_KEY = "KTimer.savedTimers";
const SELECTED_KEY = "KTimer.selectedTimer";

export function loadTimers(): KTimerItem[] | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as KTimerItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    return parsed;
  } catch (error) {
    console.error("타이머 불러오기 실패:", error);
    return null;
  }
}

export function saveTimers(timers: KTimerItem[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(timers));
  } catch (error) {
    console.error("타이머 저장 실패:", error);
  }
}

export function loadSelectedTimerId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SELECTED_KEY);
}

export function saveSelectedTimerId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SELECTED_KEY, id);
}
