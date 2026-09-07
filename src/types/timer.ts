export type TimerStatus = "idle" | "running" | "paused" | "completed";
export type TimerCategory =
  | "productivity"
  | "fitness"
  | "utility"
  | "psychological"
  | "custom";
export type StepType = "work" | "rest" | "prep" | "cooldown" | "step" | "flow";

export interface TimerStep {
  id: string;
  title: string;
  durationSeconds: number; // 0 = count-up (flowtime / stopwatch)
  type: StepType;
  metadata?: Record<string, unknown>;
  color?: string;
}

export interface TimerPreset {
  id: string;
  name: string;
  category: TimerCategory;
  description: string;
  steps: TimerStep[];
  configurable?: Partial<TimerStep>[];
  iconKey?: string;
}

export interface LapRecord {
  index: number;
  elapsedMs: number;
  at: number;
}

export interface ActiveTimerSession {
  presetId: string;
  presetName: string;
  currentStepIndex: number;
  remainingMs: number;
  status: TimerStatus;
  elapsedMs: number;
  laps: LapRecord[];
  startedAt?: number;
  pausedAt?: number;
  steps: TimerStep[];
  isCountUp: boolean;
  countUpMs: number;
}

export interface GeneratedTimer {
  title: string;
  description: string;
  steps: TimerStep[];
}
