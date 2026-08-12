export const TIMER_COLORS = [
  "red",
  "orange",
  "pink",
  "green",
  "mint",
  "blue",
  "purple",
] as const;

export type TimerColor = (typeof TIMER_COLORS)[number];

export const TIMER_COLOR_HEX: Record<TimerColor, string> = {
  red: "#F50519",
  orange: "#FF9500",
  pink: "#FF2D55",
  green: "#34C759",
  mint: "#00C7BE",
  blue: "#007AFF",
  purple: "#AF52DE",
};

export const ALARM_SOUNDS = ["chime", "bell", "electronic"] as const;

export type AlarmSound = (typeof ALARM_SOUNDS)[number];

export const ALARM_SOUND_INFO: Record<
  AlarmSound,
  { title: string; icon: string }
> = {
  chime: { title: "차임", icon: "music-note" },
  bell: { title: "종소리", icon: "bell" },
  electronic: { title: "전자벨", icon: "waveform" },
};

export interface KTimerItem {
  id: string;
  name: string;
  durationMinutes: number;
  remainingSeconds: number;
  color: TimerColor;
  isLocked: boolean;
  soundEnabled: boolean;
  alarmSound: AlarmSound;
  alarmVolume: number;
  alarmRepeatCount: number;
}

export function createTimer(
  params: {
    name: string;
    durationMinutes: number;
    color?: TimerColor;
    isLocked?: boolean;
    soundEnabled?: boolean;
    alarmSound?: AlarmSound;
    alarmVolume?: number;
    alarmRepeatCount?: number;
  },
  id: string = crypto.randomUUID()
): KTimerItem {
  const durationMinutes = params.durationMinutes;

  return {
    id,
    name: params.name,
    durationMinutes,
    remainingSeconds: durationMinutes * 60,
    color: params.color ?? "red",
    isLocked: params.isLocked ?? false,
    soundEnabled: params.soundEnabled ?? true,
    alarmSound: params.alarmSound ?? "chime",
    alarmVolume: params.alarmVolume ?? 1.0,
    alarmRepeatCount: params.alarmRepeatCount ?? 3,
  };
}
