"use client";

import { Check } from "lucide-react";
import type { TimerStep } from "@/types/timer";

interface ChainedStepsQueueProps {
  steps: TimerStep[];
  currentIndex: number;
  isCountUp: boolean;
}

function secondsLabel(sec: number): string {
  if (sec === 0) return "∞";
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export function ChainedStepsQueue({
  steps,
  currentIndex,
  isCountUp,
}: ChainedStepsQueueProps) {
  return (
    <ol className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
      {steps.map((step, idx) => {
        const isDone = idx < currentIndex || (isCountUp && idx < currentIndex);
        const isCurrent = idx === currentIndex;
        return (
          <li
            key={step.id + idx}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 border ${
              isCurrent
                ? "border-accent bg-accent-soft"
                : isDone
                ? "border-border bg-bg-card/40 opacity-60"
                : "border-border bg-bg-card"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                isCurrent
                  ? "bg-accent text-bg-base"
                  : isDone
                  ? "bg-accent/40 text-accent"
                  : "bg-bg-hover text-text-secondary"
              }`}
            >
              {isDone ? <Check size={14} /> : idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-sm truncate ${
                  isCurrent ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {step.title}
              </div>
              <div className="text-xs text-text-muted capitalize">
                {step.type}
              </div>
            </div>
            <div
              className="text-xs font-mono tabular-nums text-text-secondary"
              style={step.color ? { color: step.color } : undefined}
            >
              {secondsLabel(step.durationSeconds)}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
