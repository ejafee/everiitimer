"use client";

import { useMemo } from "react";

interface TimerDisplayProps {
  remainingMs: number;
  isCountUp?: boolean;
  countUpMs?: number;
  size?: "sm" | "md" | "lg" | "xl";
  showMs?: boolean;
}

function format(ms: number, showMs: boolean): string {
  const clamped = Math.max(0, ms);
  const totalSec = Math.floor(clamped / 1000);
  const hh = Math.floor(totalSec / 3600);
  const mm = Math.floor((totalSec % 3600) / 60);
  const ss = totalSec % 60;
  const mss = Math.floor((clamped % 1000) / 10); // 1/100 sec
  const base =
    hh > 0
      ? `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
      : `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return showMs ? `${base}.${String(mss).padStart(2, "0")}` : base;
}

const SIZE_CLASS = {
  sm: "text-3xl",
  md: "text-5xl",
  lg: "text-7xl",
  xl: "text-9xl",
} as const;

export function TimerDisplay({
  remainingMs,
  isCountUp = false,
  countUpMs = 0,
  size = "lg",
  showMs = true,
}: TimerDisplayProps) {
  const displayMs = isCountUp ? countUpMs : remainingMs;
  const text = useMemo(() => format(displayMs, showMs), [displayMs, showMs]);
  const isLow = !isCountUp && remainingMs > 0 && remainingMs <= 5000;
  return (
    <div
      className={`font-mono tabular-nums tracking-tight ${SIZE_CLASS[size]} ${
        isLow ? "text-warning" : "text-text-primary"
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      {text}
    </div>
  );
}
