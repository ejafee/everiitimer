"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Settings, Sparkles, X } from "lucide-react";
import { BUILT_IN_PRESETS } from "@/lib/presets";
import { useTimerStore } from "@/store/timer-store";
import { createTimerEngine, type TimerEngine } from "@/lib/timer-engine";
import { AudioAlerts, unlockAudio } from "@/lib/audio";
import { CategoryTabs, type CategoryFilter } from "@/components/CategoryTabs";
import { PresetGrid } from "@/components/PresetGrid";
import { PromptBuilderModal } from "@/components/PromptBuilderModal";
import { SettingsModal } from "@/components/SettingsModal";
import { TimerDisplay } from "@/components/TimerDisplay";
import { TimerControls } from "@/components/TimerControls";
import { ChainedStepsQueue } from "@/components/ChainedStepsQueue";
import { VisualTimerDisk } from "@/components/VisualTimerDisk";
import type { ActiveTimerSession, TimerPreset } from "@/types/timer";

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function HomePage() {
  const customPresets = useTimerStore((s) => s.customPresets);
  const removeCustomPreset = useTimerStore((s) => s.removeCustomPreset);
  const settings = useTimerStore((s) => s.settings);
  const addToHistory = useTimerStore((s) => s.addToHistory);
  const setActiveSession = useTimerStore((s) => s.setActiveSession);

  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [activePreset, setActivePreset] = useState<TimerPreset | null>(null);
  const [session, setSession] = useState<ActiveTimerSession | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const engineRef = useRef<TimerEngine | null>(null);
  const lastSecondRef = useRef<number>(-1);

  const allPresets = useMemo(
    () => [...BUILT_IN_PRESETS, ...customPresets],
    [customPresets],
  );

  const filtered = useMemo(
    () =>
      filter === "all"
        ? allPresets
        : allPresets.filter((p) => p.category === filter),
    [allPresets, filter],
  );

  const counts = useMemo(() => {
    const c: Record<CategoryFilter, number> = {
      all: allPresets.length,
      productivity: 0,
      fitness: 0,
      utility: 0,
      psychological: 0,
      custom: 0,
    };
    for (const p of allPresets) c[p.category]++;
    return c;
  }, [allPresets]);

  const startPreset = (preset: TimerPreset) => {
    engineRef.current?.destroy();
    unlockAudio();
    const engine = createTimerEngine(preset.steps, preset.id, preset.name, {
      onTick: (s) => {
        setSession(s);
        setActiveSession(s);
      },
      onTickSecond: (s) => {
        if (!settings.sound) return;
        const secRemaining = Math.ceil(s.remainingMs / 1000);
        if (
          settings.tickInLast5 &&
          !s.isCountUp &&
          secRemaining > 0 &&
          secRemaining <= 5
        ) {
          AudioAlerts.lastFiveTick();
        }
      },
      onStepChange: (s) => {
        if (settings.sound) AudioAlerts.stepTransition();
        setSession(s);
        setActiveSession(s);
      },
      onComplete: (s) => {
        if (settings.sound) AudioAlerts.sessionComplete();
        setSession(s);
        setActiveSession(s);
        addToHistory(s);
      },
    });
    engineRef.current = engine;
    lastSecondRef.current = -1;
    setActivePreset(preset);
    engine.start();
  };

  const exitSession = () => {
    engineRef.current?.destroy();
    engineRef.current = null;
    setActivePreset(null);
    setSession(null);
    setActiveSession(null);
  };

  const handleStart = () => {
    unlockAudio();
    engineRef.current?.start();
  };
  const handlePause = () => engineRef.current?.pause();
  const handleResume = () => {
    unlockAudio();
    engineRef.current?.resume();
  };
  const handleReset = () => engineRef.current?.reset();
  const handleSkip = () => engineRef.current?.skip();
  const handleLap = () => engineRef.current?.lap();

  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
    };
  }, []);

  if (activePreset && session) {
    const currentStep = session.steps[session.currentStepIndex];
    const totalStepMs = currentStep.durationSeconds * 1000;
    return (
      <main className="min-h-screen flex flex-col">
        <header className="border-b border-border bg-bg-elevated">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="text-text-secondary text-sm">
              <span className="text-text-primary font-medium">
                {activePreset.name}
              </span>
              <span className="mx-2 text-text-muted">·</span>
              <span>
                Step {session.currentStepIndex + 1} / {session.steps.length}
              </span>
            </div>
            <button
              type="button"
              onClick={exitSession}
              className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm"
            >
              <X size={16} /> Exit
            </button>
          </div>
        </header>

        <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 grid lg:grid-cols-[1fr_320px] gap-8">
          <section className="flex flex-col items-center justify-center gap-6">
            <div className="text-text-secondary uppercase tracking-widest text-xs">
              {currentStep.title} · {currentStep.type}
            </div>
            <VisualTimerDisk
              remainingMs={session.remainingMs}
              totalMs={totalStepMs}
              isCountUp={session.isCountUp}
              countUpMs={session.countUpMs}
              color={currentStep.color ?? "#22c55e"}
              size={360}
              thickness={20}
            />
            <TimerDisplay
              remainingMs={session.remainingMs}
              isCountUp={session.isCountUp}
              countUpMs={session.countUpMs}
              size="xl"
              showMs
            />
            <TimerControls
              status={session.status}
              isCountUp={session.isCountUp}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onReset={handleReset}
              onSkip={handleSkip}
              onLap={handleLap}
            />
            {session.laps.length > 0 ? (
              <div className="w-full max-w-md rounded-xl border border-border bg-bg-card p-3 text-sm">
                <div className="text-text-muted text-xs uppercase tracking-wider mb-2">
                  Laps
                </div>
                <ol className="flex flex-col gap-1">
                  {session.laps.map((lap) => {
                    const totalSec = Math.floor(lap.elapsedMs / 1000);
                    const mm = Math.floor(totalSec / 60);
                    const ss = totalSec % 60;
                    const ms = Math.floor((lap.elapsedMs % 1000) / 10);
                    return (
                      <li
                        key={lap.index}
                        className="flex justify-between font-mono tabular-nums"
                      >
                        <span className="text-text-secondary">
                          Lap {lap.index}
                        </span>
                        <span className="text-text-primary">
                          {String(mm).padStart(2, "0")}:
                          {String(ss).padStart(2, "0")}.
                          {String(ms).padStart(2, "0")}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : null}
          </section>

          <aside>
            <h2 className="text-text-secondary text-xs uppercase tracking-wider mb-3">
              Queue
            </h2>
            <ChainedStepsQueue
              steps={session.steps}
              currentIndex={session.currentStepIndex}
              isCountUp={session.isCountUp}
            />
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-bg-elevated">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              Everiitimer
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              15+ presets. AI-generated custom timers. Zero-friction focus.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPromptOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-bg-card hover:bg-bg-hover text-text-primary text-sm"
            >
              <Sparkles size={14} className="text-accent" />
              AI Custom Timer
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-bg-card hover:bg-bg-hover text-text-secondary"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <CategoryTabs active={filter} onChange={setFilter} counts={counts} />
        <PresetGrid
          presets={filtered}
          onStart={startPreset}
          onDelete={
            filter === "custom" || filter === "all"
              ? (id) => {
                  if (BUILT_IN_PRESETS.find((p) => p.id === id)) return;
                  removeCustomPreset(id);
                }
              : undefined
          }
          emptyHint={
            filter === "custom"
              ? "No custom timers yet. Click 'AI Custom Timer' to generate one."
              : "No presets in this category."
          }
        />
      </div>

      <PromptBuilderModal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </main>
  );
}
