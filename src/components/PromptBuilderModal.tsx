"use client";

import { useState } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";
import { useTimerStore } from "@/store/timer-store";
import type { GeneratedTimer, TimerPreset } from "@/types/timer";

interface PromptBuilderModalProps {
  open: boolean;
  onClose: () => void;
}

const EXAMPLES = [
  "Cook a steak: 2 min sear, flip, 2 min, rest 5 min",
  "Workout: warm-up 5 min, 3 rounds of 40s burpees + 20s rest, cool-down 5 min",
  "Study: 50 min focus, 10 min break",
];

function generatedToPreset(g: GeneratedTimer): TimerPreset {
  return {
    id: `custom-${Date.now()}`,
    name: g.title,
    category: "custom",
    description: g.description,
    steps: g.steps,
    iconKey: "Sparkles",
  };
}

export function PromptBuilderModal({ open, onClose }: PromptBuilderModalProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const geminiApiKey = useTimerStore((s) => s.geminiApiKey);
  const addCustomPreset = useTimerStore((s) => s.addCustomPreset);

  if (!open) return null;

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, apiKey: geminiApiKey || undefined }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as GeneratedTimer;
      addCustomPreset(generatedToPreset(data));
      setPrompt("");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-bg-base/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-modal-title"
    >
      <div className="w-full max-w-xl rounded-2xl border border-border-strong bg-bg-elevated shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-accent" />
            <h2
              id="prompt-modal-title"
              className="text-text-primary font-semibold"
            >
              AI Custom Timer
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-text-muted hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <p className="text-text-secondary text-sm">
            Describe the timer in plain language. Gemini converts it into a
            structured multi-step sequence.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 10 min warm-up, 4 rounds of 30s work 30s rest, 5 min cool-down"
            rows={4}
            maxLength={1000}
            className="w-full rounded-lg bg-bg-card border border-border focus:border-accent focus:outline-none px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none"
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPrompt(ex)}
                className="text-xs px-2.5 py-1 rounded-full border border-border bg-bg-card hover:bg-bg-hover text-text-secondary"
              >
                {ex}
              </button>
            ))}
          </div>
          {error ? (
            <div className="text-xs text-danger" role="alert">
              {error}
            </div>
          ) : null}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-text-muted">
              {prompt.length}/1000 ·{" "}
              {geminiApiKey ? "using your API key" : "no key (mock parser)"}
            </span>
            <button
              type="button"
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-bg-base text-sm font-medium"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate Timer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
