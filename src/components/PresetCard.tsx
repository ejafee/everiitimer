"use client";

import {
  Brain,
  Coffee,
  Cookie,
  Clock,
  Dumbbell,
  Eye,
  Sparkles,
  Target,
  Play,
  Trash2,
  LucideIcon,
} from "lucide-react";
import type { TimerPreset } from "@/types/timer";

const ICONS: Record<string, LucideIcon> = {
  Brain,
  Coffee,
  Cookie,
  Clock,
  Dumbbell,
  Eye,
  Sparkles,
  Target,
};

interface PresetCardProps {
  preset: TimerPreset;
  onStart: (preset: TimerPreset) => void;
  onDelete?: (id: string) => void;
}

function totalSeconds(preset: TimerPreset): number {
  return preset.steps.reduce((sum, s) => sum + s.durationSeconds, 0);
}

function totalLabel(preset: TimerPreset): string {
  const total = totalSeconds(preset);
  if (preset.steps.some((s) => s.durationSeconds === 0)) {
    return "Open-ended";
  }
  const m = Math.round(total / 60);
  if (m < 60) return `${m} min total`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h} hr` : `${h}h ${rem}m`;
}

export function PresetCard({ preset, onStart, onDelete }: PresetCardProps) {
  const Icon = ICONS[preset.iconKey ?? ""] ?? Clock;
  return (
    <div className="group rounded-2xl border border-border bg-bg-card hover:border-border-strong transition-colors p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-bg-hover flex items-center justify-center">
          <Icon size={20} className="text-accent" />
        </div>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(preset.id)}
            aria-label="Delete preset"
            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-opacity"
          >
            <Trash2 size={16} />
          </button>
        ) : null}
      </div>
      <div>
        <h3 className="text-text-primary font-semibold text-base leading-tight">
          {preset.name}
        </h3>
        <p className="text-text-secondary text-sm mt-1 leading-snug">
          {preset.description}
        </p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="text-xs text-text-muted">
          {preset.steps.length} step{preset.steps.length === 1 ? "" : "s"} ·{" "}
          {totalLabel(preset)}
        </div>
        <button
          type="button"
          onClick={() => onStart(preset)}
          aria-label={`Start ${preset.name}`}
          className="rounded-full bg-accent hover:bg-accent-hover w-9 h-9 flex items-center justify-center"
        >
          <Play size={16} className="text-bg-base" fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
