# Everiitimer

A scalable web app for every timer you'll ever need — productivity, fitness, ADHD-friendly visual timers, chained sequences, and AI-generated custom timers via Google Gemini.

[Live demo](https://github.com/ejafee/everiitimer) · [Report bug](https://github.com/ejafee/everiitimer/issues) · [Request timer](https://github.com/ejafee/everiitimer/issues)

---

## What's inside

20+ preset timers across 4 categories, plus an AI prompt builder for any custom sequence you can describe.

### Productivity & Focus
- **Pomodoro** — 25m work / 5m break × 4, then 15-30m long break
- **52/17 Method** — 52m work / 17m break loop
- **90-Minute Ultradian** — 90m deep work / 20-30m recovery loop
- **Flowtime** — count-up stopwatch; auto-calculates proportional break on stop
- **Animedoro** — 40-60m work / 20m break (one episode)

### Fitness & Sports
- **Tabata** — 8 rounds × 20s work / 10s rest
- **EMOM** — every minute on the minute, with remainder-as-rest
- **AMRAP** — as many rounds as possible, with round counter
- **Boxing / MMA** — 3m or 5m rounds, 1m rest, configurable total rounds
- **Custom Circuit** — warm-up → [work → rest] × cycles → cool-down

### General Utility
- **Standard Countdown** — HH:MM:SS
- **Stopwatch** — millisecond count-up with lap list
- **Chained Multi-Timer** — sequential list, auto-advances on each completion

### Psychological & Behavioral
- **Visual Timer (Time Timer)** — colored disk that drains visually, ideal for ADHD
- **2-Minute / 10-Minute Starter** — short countdown to beat task paralysis

### AI Custom Timer
Type any scenario in plain English. Gemini converts it into a structured step sequence.

Examples:
- *"1st warming 100°C 5 min, then bake 250°C 10 min, rest 5 min"*
- *"3 rounds of 45s plank, 15s rest, then stretch 2 min"*
- *"pomodoro x4 but with 30 min work blocks"*

---

## Tech stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **State**: Zustand with localStorage persistence
- **AI**: Google Gemini 1.5 Flash via `@google/generative-ai`
- **Audio**: Web Audio API — synthesized tones, zero asset downloads
- **Testing**: Vitest + jsdom + Testing Library (25 tests, 100% engine + parser coverage)
- **Timing**: `requestAnimationFrame` + `performance.now()` deltas — drift < 50ms, immune to background tab throttling

---

## Project structure

```
everiitimer/
├── src/
│   ├── app/
│   │   ├── api/generate-timer/route.ts   # Gemini endpoint
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                       # main UI
│   ├── components/
│   │   ├── CategoryTabs.tsx
│   │   ├── ChainedStepsQueue.tsx
│   │   ├── PresetCard.tsx
│   │   ├── PresetGrid.tsx
│   │   ├── PromptBuilderModal.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── TimerControls.tsx
│   │   ├── TimerDisplay.tsx
│   │   └── VisualTimerDisk.tsx            # SVG pie drain
│   ├── lib/
│   │   ├── __tests__/
│   │   │   ├── gemini-parser.test.ts
│   │   │   └── timer-engine.test.ts
│   │   ├── audio.ts                        # Web Audio synth
│   │   ├── gemini.ts                       # prompt → TimerStep[]
│   │   ├── presets.ts                      # 20 built-in presets
│   │   └── timer-engine.ts                 # state machine + rAF loop
│   ├── store/
│   │   └── timer-store.ts                  # Zustand + persist
│   └── types/
│       └── timer.ts
├── .gitignore
├── LICENSE
├── README.md
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## Getting started

### Prerequisites
- Node.js 20+
- npm 10+
- (Optional) Google Gemini API key — [get one free](https://aistudio.google.com/app/apikey)

### Install
```bash
npm install
```

### Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Build
```bash
npm run build
npm start
```

### Test
```bash
npm test              # one-shot
npm run test:watch    # watch mode
```

---

## Environment variables

Create `.env.local` (optional — for server-side Gemini calls):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Without a server key, the AI Custom Timer still works: paste your own key into the Settings modal and it's stored only in your browser's localStorage. Nothing leaves your machine.

---

## Usage

1. Pick a category tab (Productivity / Fitness / Utility / Psychological / Custom).
2. Click any preset card to launch.
3. Use **Play / Pause / Skip / Reset / Lap** controls.
4. For chained or multi-round timers, the right panel shows upcoming steps.
5. For Visual Timer, watch the colored disk drain — the digital readout is hidden by default.
6. Click **+ AI Custom Timer** to describe a new sequence in plain English.

### Settings
Open the gear icon to:
- Set / clear your Gemini API key
- Toggle audio alerts
- Toggle tick sound in the last 5 seconds
- Toggle auto-advance between steps

---

## Architecture notes

### Generic step engine
Every timer — preset or AI-generated — is an array of `TimerStep` objects. The engine doesn't care if it's Pomodoro, Tabata, or a baking recipe. This is what makes the AI builder work: Gemini just produces the same shape.

### Drift-free timing
Naive `setInterval` loses 100s+ per hour in background tabs. The engine uses `requestAnimationFrame` with `performance.now()` deltas, so timing stays accurate even when you switch tabs or minimize.

### Zero-asset audio
All beeps and alarms are synthesized via Web Audio oscillators. No MP3s, no load times, no hosting costs.

### Local-first persistence
Custom presets, history, settings, and your API key live in `localStorage` under `everiitimer-store`. No backend required for the core app. The only network call is when you generate an AI timer.

---

## Deployment

Any Next.js-compatible host works:

```bash
# Vercel (recommended)
npx vercel

# Static export (no API routes — disables server-side Gemini)
# Set output: 'export' in next.config.mjs
npm run build
```

If you deploy with `output: 'export'`, the AI builder still works using the user-supplied API key.

---

## Contributing

1. Fork the repo
2. Create your branch: `git checkout -b feat/new-timer`
3. Add a preset in `src/lib/presets.ts` and a test in `src/lib/__tests__/`
4. Run `npm test` and `npm run build`
5. Open a PR

New timer ideas: open an issue with the title `[TIMER] Your Timer Name` and the work/break logic.

---

## License

MIT — see [LICENSE](LICENSE).

Copyright (c) 2026 Muhammad Faeyza Ashira
