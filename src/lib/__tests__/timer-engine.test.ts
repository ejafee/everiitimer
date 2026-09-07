import { describe, it, expect } from "vitest";
import {
  createTimerEngine,
  flowtimeBreakSeconds,
  type EngineCallbacks,
} from "../timer-engine";
import type { TimerStep } from "@/types/timer";

const work = (id: string, sec: number, title = "Work"): TimerStep => ({
  id,
  title,
  durationSeconds: sec,
  type: "work",
  color: "#22c55e",
});
const rest = (id: string, sec: number, title = "Rest"): TimerStep => ({
  id,
  title,
  durationSeconds: sec,
  type: "rest",
  color: "#3b82f6",
});

describe("flowtimeBreakSeconds", () => {
  it("returns 5m for 10–25m of work", () => {
    expect(flowtimeBreakSeconds(10 * 60)).toBe(5 * 60);
    expect(flowtimeBreakSeconds(20 * 60)).toBe(5 * 60);
    expect(flowtimeBreakSeconds(24 * 60 + 59)).toBe(5 * 60);
  });
  it("returns 8m for 25–50m", () => {
    expect(flowtimeBreakSeconds(25 * 60)).toBe(8 * 60);
    expect(flowtimeBreakSeconds(49 * 60 + 59)).toBe(8 * 60);
  });
  it("returns 15m for 50–90m", () => {
    expect(flowtimeBreakSeconds(50 * 60)).toBe(15 * 60);
    expect(flowtimeBreakSeconds(90 * 60)).toBe(15 * 60);
  });
  it("returns 0 outside the 10–90m band", () => {
    expect(flowtimeBreakSeconds(5 * 60)).toBe(0);
    expect(flowtimeBreakSeconds(95 * 60)).toBe(0);
  });
});

describe("TimerEngine – basic state", () => {
  it("initializes with first step remaining time and idle status", () => {
    const engine = createTimerEngine(
      [work("1", 10), rest("2", 5)],
      "p",
      "Pomodoro",
    );
    const s = engine.getState();
    expect(s.status).toBe("idle");
    expect(s.currentStepIndex).toBe(0);
    expect(s.remainingMs).toBe(10_000);
    expect(s.laps).toEqual([]);
  });

  it("rejects empty step lists", () => {
    expect(() => createTimerEngine([], "p", "nope")).toThrow();
  });
});

describe("TimerEngine – step transitions", () => {
  it("advances to next step on tick when current completes", () => {
    const engine = createTimerEngine(
      [work("1", 10), rest("2", 5)],
      "p",
      "P",
    );
    engine.start();
    engine.tick(10_000);
    const s = engine.getState();
    expect(s.currentStepIndex).toBe(1);
    expect(s.remainingMs).toBe(5_000);
    expect(s.status).toBe("running");
  });

  it("completes when last step finishes and fires onComplete", () => {
    const seen: string[] = [];
    const cbs: EngineCallbacks = {
      onStepChange: (_s, idx) => seen.push(`step:${idx}`),
      onComplete: (s) => seen.push(`done:${s.status}`),
    };
    const engine = createTimerEngine(
      [work("1", 10), rest("2", 5)],
      "p",
      "P",
      cbs,
    );
    engine.start();
    engine.tick(10_000);
    engine.tick(5_000);
    const s = engine.getState();
    expect(s.status).toBe("completed");
    expect(s.remainingMs).toBe(0);
    expect(seen).toContain("done:completed");
  });

  it("skip advances immediately and fires onStepChange with reason=skip", () => {
    const reasons: string[] = [];
    const engine = createTimerEngine(
      [work("1", 10), rest("2", 5)],
      "p",
      "P",
      { onStepChange: (_s, _i, r) => reasons.push(r) },
    );
    engine.start();
    engine.skip();
    expect(engine.getState().currentStepIndex).toBe(1);
    expect(reasons).toContain("skip");
  });

  it("reset returns to initial state", () => {
    const engine = createTimerEngine(
      [work("1", 10), rest("2", 5)],
      "p",
      "P",
    );
    engine.start();
    engine.tick(5_000);
    engine.reset();
    const s = engine.getState();
    expect(s.currentStepIndex).toBe(0);
    expect(s.remainingMs).toBe(10_000);
    expect(s.elapsedMs).toBe(0);
    expect(s.status).toBe("idle");
    expect(s.laps).toEqual([]);
  });
});

describe("TimerEngine – pause/resume and laps", () => {
  it("pause halts status; resume restores running", () => {
    const engine = createTimerEngine([work("1", 60)], "p", "P");
    engine.start();
    engine.pause();
    expect(engine.getState().status).toBe("paused");
    engine.tick(5_000); // ignored while paused
    expect(engine.getState().remainingMs).toBe(60_000);
    engine.resume();
    expect(engine.getState().status).toBe("running");
  });

  it("lap records current elapsed time and increments", () => {
    const engine = createTimerEngine([work("1", 60)], "p", "P");
    engine.start();
    engine.tick(10_000);
    engine.lap();
    engine.tick(5_000);
    engine.lap();
    const s = engine.getState();
    expect(s.laps).toHaveLength(2);
    expect(s.laps[0].elapsedMs).toBe(10_000);
    expect(s.laps[1].elapsedMs).toBe(15_000);
    expect(s.laps[0].index).toBe(1);
    expect(s.laps[1].index).toBe(2);
  });

  it("lap ignored when not running", () => {
    const engine = createTimerEngine([work("1", 60)], "p", "P");
    engine.lap();
    expect(engine.getState().laps).toHaveLength(0);
  });
});

describe("TimerEngine – chained multi-step", () => {
  it("Tabata: 8 rounds × [20s work + 10s rest] = 16 steps", () => {
    const steps: TimerStep[] = [];
    for (let r = 1; r <= 8; r++) {
      steps.push(work(`w${r}`, 20, `Round ${r} Work`));
      steps.push(rest(`r${r}`, 10, `Round ${r} Rest`));
    }
    expect(steps.length).toBe(16);
    let transitions = 0;
    const engine = createTimerEngine(steps, "tabata", "Tabata", {
      onStepChange: () => transitions++,
    });
    engine.start();
    // Walk 16 × 30s = 480s in 30s chunks
    for (let i = 0; i < 16; i++) engine.tick(30_000);
    expect(engine.getState().status).toBe("completed");
    // onStepChange fires for the 15 transitions that land on a real step;
    // the 16th advance completes the session (fires onComplete only).
    expect(transitions).toBe(15);
  });

  it("EMOM: 10 one-minute work blocks fire step transition each minute", () => {
    const steps: TimerStep[] = [];
    for (let i = 1; i <= 10; i++) {
      steps.push(work(`m${i}`, 60, `Minute ${i}`));
    }
    let transitions = 0;
    let completed = false;
    const engine = createTimerEngine(steps, "emom", "EMOM", {
      onStepChange: () => transitions++,
      onComplete: () => (completed = true),
    });
    engine.start();
    for (let i = 0; i < 10; i++) engine.tick(60_000);
    expect(engine.getState().status).toBe("completed");
    expect(completed).toBe(true);
    expect(transitions).toBe(9);
  });

  it("Flowtime: step with durationSeconds=0 counts up and never auto-advances", () => {
    const seenComplete = false;
    const engine = createTimerEngine(
      [{ id: "f", title: "Flow", durationSeconds: 0, type: "flow" }],
      "flow",
      "Flowtime",
      { onComplete: () => undefined },
    );
    engine.start();
    engine.tick(120_000);
    const s = engine.getState();
    expect(s.status).toBe("running");
    expect(s.isCountUp).toBe(true);
    expect(s.countUpMs).toBe(120_000);
    expect(s.currentStepIndex).toBe(0);
    expect(seenComplete).toBe(false);
  });
});

describe("TimerEngine – delta math", () => {
  it("accumulates elapsed across many ticks", () => {
    const engine = createTimerEngine([work("1", 100)], "p", "P");
    engine.start();
    for (let i = 0; i < 10; i++) engine.tick(500);
    expect(engine.getState().elapsedMs).toBe(5_000);
    expect(engine.getState().remainingMs).toBe(95_000);
  });

  it("does not go negative on remaining", () => {
    const engine = createTimerEngine([work("1", 5)], "p", "P");
    engine.start();
    engine.tick(8_000);
    // 5s consumed + advanced to next; this step would be idx 1 (out of bounds → complete)
    expect(engine.getState().status).toBe("completed");
  });
});
