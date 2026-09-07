"use client";

let audioCtx: AudioContext | null = null;
let unlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  audioCtx = new Ctor();
  return audioCtx;
}

/**
 * Call from a user gesture (click) to unlock the AudioContext.
 * Browsers require a gesture before audio can play.
 */
export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  unlocked = true;
}

export function isAudioUnlocked(): boolean {
  return unlocked && !!audioCtx && audioCtx.state === "running";
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3,
): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + Math.max(0.01, duration),
  );
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playSequence(
  notes: { freq: number; dur: number; type?: OscillatorType; gap?: number }[],
): void {
  let offset = 0;
  for (const n of notes) {
    const start = offset;
    setTimeout(() => playTone(n.freq, n.dur, n.type ?? "sine", 0.2), start);
    offset += (n.gap ?? 150) + n.dur * 1000;
  }
}

export const AudioAlerts = {
  tick: () => playTone(880, 0.05, "sine", 0.15),
  stepTransition: () => playTone(1200, 0.2, "triangle", 0.25),
  sessionComplete: () =>
    playSequence([
      { freq: 523.25, dur: 0.2, type: "sine" },
      { freq: 659.25, dur: 0.2, type: "sine", gap: 120 },
      { freq: 783.99, dur: 0.4, type: "sine", gap: 120 },
    ]),
  emomMarker: () => playTone(880, 0.3, "square", 0.2),
  lastFiveTick: () => playTone(660, 0.08, "sine", 0.18),
};
