"use client";

import { PresetCard } from "./PresetCard";
import type { TimerPreset } from "@/types/timer";

interface PresetGridProps {
  presets: TimerPreset[];
  onStart: (preset: TimerPreset) => void;
  onDelete?: (id: string) => void;
  emptyHint?: string;
}

export function PresetGrid({
  presets,
  onStart,
  onDelete,
  emptyHint,
}: PresetGridProps) {
  if (presets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-bg-card/40 p-10 text-center text-text-muted text-sm">
        {emptyHint ?? "No presets in this category yet."}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {presets.map((preset) => (
        <PresetCard
          key={preset.id}
          preset={preset}
          onStart={onStart}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
