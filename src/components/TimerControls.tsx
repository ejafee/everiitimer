"use client";

import { Play, Pause, SkipForward, RotateCcw, Flag } from "lucide-react";
import type { TimerStatus } from "@/types/timer";

interface TimerControlsProps {
  status: TimerStatus;
  isCountUp: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
  onLap: () => void;
}

export function TimerControls({
  status,
  isCountUp,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
  onLap,
}: TimerControlsProps) {
  const primary =
    status === "running" ? (
      <button
        type="button"
        onClick={onPause}
        aria-label="Pause"
        className="rounded-full bg-bg-card hover:bg-bg-hover border border-border-strong w-16 h-16 flex items-center justify-center"
      >
        <Pause size={28} className="text-text-primary" />
      </button>
    ) : (
      <button
        type="button"
        onClick={status === "paused" ? onResume : onStart}
        aria-label={status === "paused" ? "Resume" : "Start"}
        className="rounded-full bg-accent hover:bg-accent-hover w-16 h-16 flex items-center justify-center"
      >
        <Play size={28} className="text-bg-base" fill="currentColor" />
      </button>
    );

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onReset}
        aria-label="Reset"
        title="Reset"
        className="rounded-full bg-bg-card hover:bg-bg-hover border border-border-strong w-12 h-12 flex items-center justify-center"
      >
        <RotateCcw size={20} className="text-text-secondary" />
      </button>
      {primary}
      <button
        type="button"
        onClick={onSkip}
        aria-label="Skip step"
        title="Skip step"
        className="rounded-full bg-bg-card hover:bg-bg-hover border border-border-strong w-12 h-12 flex items-center justify-center"
      >
        <SkipForward size={20} className="text-text-secondary" />
      </button>
      {isCountUp ? (
        <button
          type="button"
          onClick={onLap}
          aria-label="Record lap"
          title="Lap"
          className="rounded-full bg-bg-card hover:bg-bg-hover border border-border-strong w-12 h-12 flex items-center justify-center"
        >
          <Flag size={20} className="text-text-secondary" />
        </button>
      ) : null}
    </div>
  );
}
