"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ActiveTimerSession, TimerPreset } from "@/types/timer";

export type Theme = "dark" | "light";

export interface TimerSettings {
  theme: Theme;
  sound: boolean;
  autoAdvance: boolean;
  tickInLast5: boolean;
}

interface TimerState {
  activeSession: ActiveTimerSession | null;
  history: ActiveTimerSession[];
  customPresets: TimerPreset[];
  geminiApiKey: string;
  settings: TimerSettings;
  hydrated: boolean;
  setActiveSession: (s: ActiveTimerSession | null) => void;
  addToHistory: (s: ActiveTimerSession) => void;
  clearHistory: () => void;
  addCustomPreset: (p: TimerPreset) => void;
  removeCustomPreset: (id: string) => void;
  setGeminiKey: (k: string) => void;
  updateSettings: (s: Partial<TimerSettings>) => void;
  setHydrated: (h: boolean) => void;
}

const STORAGE_KEY = "everiitimer-store";

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      activeSession: null,
      history: [],
      customPresets: [],
      geminiApiKey: "",
      settings: {
        theme: "dark",
        sound: true,
        autoAdvance: true,
        tickInLast5: true,
      },
      hydrated: false,
      setActiveSession: (s) => set({ activeSession: s }),
      addToHistory: (s) =>
        set((state) => ({ history: [s, ...state.history].slice(0, 50) })),
      clearHistory: () => set({ history: [] }),
      addCustomPreset: (p) =>
        set((state) => ({ customPresets: [...state.customPresets, p] })),
      removeCustomPreset: (id) =>
        set((state) => ({
          customPresets: state.customPresets.filter((p) => p.id !== id),
        })),
      setGeminiKey: (k) => set({ geminiApiKey: k }),
      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),
      setHydrated: (h) => set({ hydrated: h }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        customPresets: s.customPresets,
        geminiApiKey: s.geminiApiKey,
        settings: s.settings,
        history: s.history,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
