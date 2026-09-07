"use client";

import { useState } from "react";
import { Settings, X, KeyRound } from "lucide-react";
import { useTimerStore } from "@/store/timer-store";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const geminiApiKey = useTimerStore((s) => s.geminiApiKey);
  const setGeminiKey = useTimerStore((s) => s.setGeminiKey);
  const settings = useTimerStore((s) => s.settings);
  const updateSettings = useTimerStore((s) => s.updateSettings);
  const [draftKey, setDraftKey] = useState(geminiApiKey);

  if (!open) return null;

  const save = () => {
    setGeminiKey(draftKey.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-bg-base/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border-strong bg-bg-elevated shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-accent" />
            <h2
              id="settings-modal-title"
              className="text-text-primary font-semibold"
            >
              Settings
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
        <div className="p-5 flex flex-col gap-5 text-sm">
          <div>
            <label
              htmlFor="gemini-key"
              className="flex items-center gap-2 text-text-secondary mb-2"
            >
              <KeyRound size={14} />
              Gemini API key (optional)
            </label>
            <input
              id="gemini-key"
              type="password"
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              placeholder="AIza..."
              className="w-full rounded-lg bg-bg-card border border-border focus:border-accent focus:outline-none px-3 py-2 text-text-primary placeholder:text-text-muted"
              autoComplete="off"
            />
            <p className="mt-2 text-xs text-text-muted">
              Stored locally in your browser. Get a free key at{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Google AI Studio
              </a>
              .
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <ToggleRow
              label="Sound alerts"
              checked={settings.sound}
              onChange={(v) => updateSettings({ sound: v })}
            />
            <ToggleRow
              label="Tick in last 5 seconds"
              checked={settings.tickInLast5}
              onChange={(v) => updateSettings({ tickInLast5: v })}
            />
            <ToggleRow
              label="Auto-advance chained steps"
              checked={settings.autoAdvance}
              onChange={(v) => updateSettings({ autoAdvance: v })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-text-secondary hover:bg-bg-hover text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-bg-base text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-text-secondary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full border transition-colors ${
          checked
            ? "bg-accent border-accent"
            : "bg-bg-card border-border-strong"
        }`}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-bg-base transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}
