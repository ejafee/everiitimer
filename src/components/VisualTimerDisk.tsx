"use client";

import { useMemo } from "react";

interface VisualTimerDiskProps {
  remainingMs: number;
  totalMs: number;
  isCountUp?: boolean;
  countUpMs?: number;
  color?: string;
  size?: number;
  thickness?: number;
  label?: string;
}

export function VisualTimerDisk({
  remainingMs,
  totalMs,
  isCountUp = false,
  countUpMs = 0,
  color = "#22c55e",
  size = 320,
  thickness = 16,
  label,
}: VisualTimerDiskProps) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useMemo(() => {
    if (isCountUp) {
      // Loop visually around every 10 minutes for endless count-up.
      const cycle = 10 * 60 * 1000;
      const pct = (countUpMs % cycle) / cycle;
      return pct;
    }
    if (totalMs <= 0) return 0;
    return Math.max(0, Math.min(1, remainingMs / totalMs));
  }, [isCountUp, countUpMs, remainingMs, totalMs]);

  const dashOffset = circumference * (1 - progress);
  const trackColor = "var(--border-strong)";
  const ringId = "vt-ring";

  return (
    <div
      className="relative inline-flex items-center justify-center select-none"
      style={{ width: size, height: size }}
      aria-label={`${label ?? "Timer"} ${Math.round(progress * 100)}% remaining`}
      role="img"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <defs>
          <linearGradient id={`${ringId}-grad`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${ringId}-grad)`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 250ms linear" }}
        />
      </svg>
      {label ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-text-secondary text-xs uppercase tracking-widest">
            {label}
          </div>
        </div>
      ) : null}
    </div>
  );
}
