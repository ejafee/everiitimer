import type {
  ActiveTimerSession,
  LapRecord,
  TimerStep,
} from "@/types/timer";

export type EngineStepChangeReason = "complete" | "skip" | "lap" | "reset";

export interface EngineCallbacks {
  onStepChange?: (
    session: ActiveTimerSession,
    nextIndex: number,
    reason: EngineStepChangeReason,
  ) => void;
  onComplete?: (session: ActiveTimerSession) => void;
  onTick?: (session: ActiveTimerSession) => void;
  onTickSecond?: (session: ActiveTimerSession) => void;
}

export interface TimerEngine {
  getState: () => ActiveTimerSession;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  lap: () => void;
  tick: (deltaMs?: number) => void;
  destroy: () => void;
}

/**
 * Flowtime break math: work duration → suggested break.
 * 10–25m work → 5m break
 * 25–50m work → 8m break
 * 50–90m work → 15m break
 * >90m or <10m → 0 (let user decide)
 */
export function flowtimeBreakSeconds(workSeconds: number): number {
  if (workSeconds < 10 * 60 || workSeconds > 90 * 60) return 0;
  if (workSeconds < 25 * 60) return 5 * 60;
  if (workSeconds < 50 * 60) return 8 * 60;
  return 15 * 60;
}

export function createTimerEngine(
  steps: TimerStep[],
  presetId: string,
  presetName: string,
  callbacks: EngineCallbacks = {},
): TimerEngine {
  if (steps.length === 0) {
    throw new Error("createTimerEngine: steps array must not be empty");
  }

  const firstStep = steps[0];
  const isCountUp = firstStep.durationSeconds === 0;

  let state: ActiveTimerSession = {
    presetId,
    presetName,
    currentStepIndex: 0,
    remainingMs: firstStep.durationSeconds * 1000,
    status: "idle",
    elapsedMs: 0,
    laps: [],
    steps: steps.map((s) => ({ ...s })),
    isCountUp,
    countUpMs: 0,
  };

  let rafHandle: number | null = null;
  let lastTickAt: number | null = null;
  let lastSecondFloor = -1;

  const snapshot = (): ActiveTimerSession => ({
    ...state,
    laps: [...state.laps],
    steps: state.steps.map((s) => ({ ...s })),
  });

  const stopLoop = () => {
    if (rafHandle !== null) {
      cancelAnimationFrame(rafHandle);
      rafHandle = null;
    }
    lastTickAt = null;
  };

  const advanceTo = (
    nextIndex: number,
    reason: EngineStepChangeReason = "complete",
  ): void => {
    if (nextIndex >= state.steps.length) {
      state.status = "completed";
      state.remainingMs = 0;
      stopLoop();
      callbacks.onComplete?.(snapshot());
      return;
    }
    state.currentStepIndex = nextIndex;
    const step = state.steps[nextIndex];
    state.isCountUp = step.durationSeconds === 0;
    state.remainingMs = step.durationSeconds * 1000;
    state.countUpMs = 0;
    callbacks.onStepChange?.(snapshot(), nextIndex, reason);
  };

  const loop = () => {
    if (state.status !== "running") {
      stopLoop();
      return;
    }
    const now = performance.now();
    if (lastTickAt === null) lastTickAt = now;
    const delta = now - lastTickAt;
    lastTickAt = now;
    engine.tick(delta);
    if (state.status === "running") {
      rafHandle = requestAnimationFrame(loop);
    }
  };

  const engine: TimerEngine = {
    getState: snapshot,

    start() {
      if (state.status === "completed") return;
      state.status = "running";
      state.startedAt = performance.now();
      lastTickAt = null;
      lastSecondFloor = -1;
      rafHandle = requestAnimationFrame(loop);
    },

    pause() {
      if (state.status !== "running") return;
      state.status = "paused";
      state.pausedAt = performance.now();
      stopLoop();
    },

    resume() {
      if (state.status !== "paused") return;
      state.status = "running";
      lastTickAt = null;
      rafHandle = requestAnimationFrame(loop);
    },

    reset() {
      stopLoop();
      state = {
        presetId,
        presetName,
        currentStepIndex: 0,
        remainingMs: steps[0].durationSeconds * 1000,
        status: "idle",
        elapsedMs: 0,
        laps: [],
        steps: steps.map((s) => ({ ...s })),
        isCountUp: steps[0].durationSeconds === 0,
        countUpMs: 0,
      };
      lastSecondFloor = -1;
      callbacks.onStepChange?.(snapshot(), 0, "reset");
    },

    skip() {
      advanceTo(state.currentStepIndex + 1, "skip");
    },

    lap() {
      if (state.status !== "running") return;
      const lap: LapRecord = {
        index: state.laps.length + 1,
        elapsedMs: state.elapsedMs,
        at: Date.now(),
      };
      state.laps = [...state.laps, lap];
      callbacks.onStepChange?.(snapshot(), state.currentStepIndex, "lap");
    },

    tick(deltaMs?: number) {
      if (state.status !== "running") return;
      const delta = typeof deltaMs === "number" ? deltaMs : 0;
      state.elapsedMs += delta;

      if (state.isCountUp) {
        state.countUpMs += delta;
        callbacks.onTick?.(snapshot());
        const sec = Math.floor(state.countUpMs / 1000);
        if (sec !== lastSecondFloor) {
          lastSecondFloor = sec;
          callbacks.onTickSecond?.(snapshot());
        }
        return;
      }

      state.remainingMs = Math.max(0, state.remainingMs - delta);
      callbacks.onTick?.(snapshot());
      const sec = Math.ceil(state.remainingMs / 1000);
      if (sec !== lastSecondFloor) {
        lastSecondFloor = sec;
        callbacks.onTickSecond?.(snapshot());
      }
      if (state.remainingMs <= 0) {
        advanceTo(state.currentStepIndex + 1, "complete");
      }
    },

    destroy() {
      stopLoop();
    },
  };

  return engine;
}
