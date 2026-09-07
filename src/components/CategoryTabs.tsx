"use client";

import type { TimerCategory } from "@/types/timer";

export type CategoryFilter = "all" | TimerCategory;

interface CategoryTabsProps {
  active: CategoryFilter;
  onChange: (next: CategoryFilter) => void;
  counts: Record<CategoryFilter, number>;
}

const ORDER: CategoryFilter[] = [
  "all",
  "productivity",
  "fitness",
  "utility",
  "psychological",
  "custom",
];

const LABEL: Record<CategoryFilter, string> = {
  all: "All",
  productivity: "Productivity",
  fitness: "Fitness",
  utility: "Utility",
  psychological: "Psychological",
  custom: "Custom",
};

export function CategoryTabs({ active, onChange, counts }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-3 mb-4">
      {ORDER.map((key) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              isActive
                ? "bg-accent text-bg-base border-accent"
                : "bg-bg-card text-text-secondary border-border hover:bg-bg-hover hover:text-text-primary"
            }`}
          >
            {LABEL[key]}
            <span
              className={`ml-2 text-xs ${
                isActive ? "text-bg-base/70" : "text-text-muted"
              }`}
            >
              {counts[key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
