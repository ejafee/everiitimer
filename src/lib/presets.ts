import type { TimerPreset, TimerStep } from "@/types/timer";

function s(
  id: string,
  title: string,
  sec: number,
  type: TimerStep["type"],
  color: string,
  metadata?: Record<string, unknown>,
): TimerStep {
  return { id, title, durationSeconds: sec, type, color, metadata };
}

const POMODORO_CYCLE = (cycle: number): TimerStep[] => [
  s(`p${cycle}-w`, "Work", 25 * 60, "work", "#22c55e"),
  s(`p${cycle}-s`, "Short Break", 5 * 60, "rest", "#3b82f6"),
];

function pomodoroSteps(): TimerStep[] {
  const steps: TimerStep[] = [];
  for (let i = 1; i <= 4; i++) {
    steps.push(...POMODORO_CYCLE(i));
  }
  steps.push(s("pl", "Long Break", 30 * 60, "rest", "#6366f1"));
  return steps;
}

function tabataSteps(): TimerStep[] {
  const steps: TimerStep[] = [];
  for (let r = 1; r <= 8; r++) {
    steps.push(s(`t${r}w`, `Round ${r} Work`, 20, "work", "#ef4444"));
    steps.push(s(`t${r}r`, `Round ${r} Rest`, 10, "rest", "#22c55e"));
  }
  return steps;
}

function emomSteps(minutes: number): TimerStep[] {
  const steps: TimerStep[] = [];
  for (let i = 1; i <= minutes; i++) {
    steps.push(s(`e${i}`, `Minute ${i}`, 60, "work", "#f59e0b"));
  }
  return steps;
}

function boxingSteps(roundSec: number, restSec: number, rounds: number): TimerStep[] {
  const steps: TimerStep[] = [];
  for (let r = 1; r <= rounds; r++) {
    steps.push(s(`b${r}w`, `Round ${r}`, roundSec, "work", "#dc2626"));
    steps.push(s(`b${r}r`, `Rest`, restSec, "rest", "#22c55e"));
  }
  return steps;
}

function customCircuitSteps(
  warmup: number,
  workSec: number,
  restSec: number,
  cycles: number,
  cooldown: number,
): TimerStep[] {
  const steps: TimerStep[] = [];
  steps.push(s("cwu", "Warm-up", warmup, "prep", "#f59e0b"));
  for (let i = 1; i <= cycles; i++) {
    steps.push(s(`c${i}w`, `Cycle ${i} Work`, workSec, "work", "#22c55e"));
    steps.push(s(`c${i}r`, `Cycle ${i} Rest`, restSec, "rest", "#3b82f6"));
  }
  steps.push(s("ccd", "Cool-down", cooldown, "cooldown", "#6366f1"));
  return steps;
}

export const BUILT_IN_PRESETS: TimerPreset[] = [
  {
    id: "pomodoro",
    name: "Pomodoro",
    category: "productivity",
    description:
      "Classic 25-minute focus blocks with short breaks. Four cycles then a long break.",
    steps: pomodoroSteps(),
    iconKey: "Brain",
  },
  {
    id: "fifty-two-seventeen",
    name: "52/17 Method",
    category: "productivity",
    description:
      "52-minute deep work followed by a 17-minute restorative break. Loops.",
    steps: [
      s("fs-w", "Work", 52 * 60, "work", "#22c55e"),
      s("fs-r", "Break", 17 * 60, "rest", "#3b82f6"),
    ],
    iconKey: "Coffee",
  },
  {
    id: "ultradian-90",
    name: "90-Minute Ultradian",
    category: "productivity",
    description:
      "Aligns work with the body's 90-minute ultradian rhythm. 90m focus, 20m recovery.",
    steps: [
      s("u-w", "Deep Work", 90 * 60, "work", "#22c55e"),
      s("u-r", "Recovery", 20 * 60, "rest", "#6366f1"),
    ],
    iconKey: "Brain",
  },
  {
    id: "flowtime",
    name: "Flowtime",
    category: "productivity",
    description:
      "Count-up stopwatch. When you stop, a proportional break is suggested (10–25m → 5m, 25–50m → 8m, 50–90m → 15m).",
    steps: [s("flow", "Flow Session", 0, "flow", "#22c55e")],
    iconKey: "Clock",
  },
  {
    id: "animedoro",
    name: "Animedoro",
    category: "productivity",
    description: "40–60 minutes of focused work, then a 20-minute anime episode break.",
    steps: [
      s("an-w", "Work", 50 * 60, "work", "#22c55e"),
      s("an-r", "Episode Break", 20 * 60, "rest", "#a855f7"),
    ],
    iconKey: "Coffee",
  },
  {
    id: "tabata",
    name: "Tabata",
    category: "fitness",
    description:
      "Eight rounds of 20s all-out work and 10s rest. The classic 4-minute HIIT protocol.",
    steps: tabataSteps(),
    iconKey: "Dumbbell",
  },
  {
    id: "emom-10",
    name: "EMOM 10",
    category: "fitness",
    description:
      "Every Minute on the Minute for 10 minutes. Beep at the top; work early, rest the remainder.",
    steps: emomSteps(10),
    iconKey: "Target",
  },
  {
    id: "emom-20",
    name: "EMOM 20",
    category: "fitness",
    description: "20-minute EMOM block.",
    steps: emomSteps(20),
    iconKey: "Target",
  },
  {
    id: "amrap-10",
    name: "AMRAP 10",
    category: "fitness",
    description:
      "As Many Rounds As Possible in 10 minutes. Use the Lap button to count rounds.",
    steps: [s("amrap", "AMRAP", 10 * 60, "work", "#f59e0b")],
    iconKey: "Dumbbell",
  },
  {
    id: "amrap-20",
    name: "AMRAP 20",
    category: "fitness",
    description: "20-minute AMRAP block.",
    steps: [s("amrap20", "AMRAP", 20 * 60, "work", "#f59e0b")],
    iconKey: "Dumbbell",
  },
  {
    id: "boxing-3",
    name: "Boxing (3m Rounds)",
    category: "fitness",
    description:
      "12 rounds of 3-minute work, 1-minute rest. Standard amateur boxing timing.",
    steps: boxingSteps(3 * 60, 60, 12),
    iconKey: "Dumbbell",
  },
  {
    id: "mma-5",
    name: "MMA (5m Rounds)",
    category: "fitness",
    description:
      "5 rounds of 5-minute work, 1-minute rest. Standard MMA bout timing.",
    steps: boxingSteps(5 * 60, 60, 5),
    iconKey: "Dumbbell",
  },
  {
    id: "custom-circuit",
    name: "Custom Circuit",
    category: "fitness",
    description:
      "5-minute warm-up, four 45s work / 15s rest cycles, 3-minute cool-down.",
    steps: customCircuitSteps(5 * 60, 45, 15, 4, 3 * 60),
    iconKey: "Dumbbell",
  },
  {
    id: "countdown-5",
    name: "5-Minute Countdown",
    category: "utility",
    description: "Simple 5-minute countdown. Great for brewing tea or quick focus blocks.",
    steps: [s("cd5", "Countdown", 5 * 60, "step", "#3b82f6")],
    iconKey: "Clock",
  },
  {
    id: "countdown-25",
    name: "25-Minute Countdown",
    category: "utility",
    description: "A plain 25-minute countdown.",
    steps: [s("cd25", "Countdown", 25 * 60, "step", "#3b82f6")],
    iconKey: "Clock",
  },
  {
    id: "stopwatch",
    name: "Stopwatch",
    category: "utility",
    description:
      "Count-up stopwatch with lap list and millisecond display. Manual stop only.",
    steps: [s("sw", "Stopwatch", 0, "flow", "#22c55e")],
    iconKey: "Clock",
  },
  {
    id: "chained-cook",
    name: "Chained: Cook Pasta",
    category: "utility",
    description:
      "Boil 10 minutes → Sauce 8 minutes → Plating 2 minutes. Each step auto-advances.",
    steps: [
      s("ch1", "Boil water & pasta", 10 * 60, "step", "#ef4444"),
      s("ch2", "Simmer sauce", 8 * 60, "step", "#f59e0b"),
      s("ch3", "Plate & serve", 2 * 60, "step", "#22c55e"),
    ],
    iconKey: "Cookie",
  },
  {
    id: "visual-timer",
    name: "Visual Timer",
    category: "psychological",
    description:
      "A pie-chart timer that drains visually. Helpful for ADHD and time-blindness.",
    steps: [s("vt", "Visual Timer", 10 * 60, "step", "#22c55e")],
    iconKey: "Eye",
  },
  {
    id: "two-minute-starter",
    name: "2-Minute Starter",
    category: "psychological",
    description:
      "Permission to quit after 2 minutes. Beats procrastination by lowering the activation cost.",
    steps: [s("2m", "Just start", 2 * 60, "step", "#22c55e")],
    iconKey: "Sparkles",
  },
  {
    id: "ten-minute-starter",
    name: "10-Minute Starter",
    category: "psychological",
    description:
      "Commit to ten minutes. Most resistance fades once you're past the start.",
    steps: [s("10m", "Commit to 10", 10 * 60, "step", "#22c55e")],
    iconKey: "Sparkles",
  },
];

export function builtInPresetById(id: string): TimerPreset | undefined {
  return BUILT_IN_PRESETS.find((p) => p.id === id);
}
