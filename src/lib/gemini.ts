import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeneratedTimer, TimerStep } from "@/types/timer";

export const TIMER_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          durationSeconds: { type: "number" },
          type: {
            type: "string",
            enum: ["work", "rest", "prep", "cooldown", "step", "flow"],
          },
          metadata: { type: "object" },
          color: { type: "string" },
        },
        required: ["id", "title", "durationSeconds", "type"],
      },
    },
  },
  required: ["title", "description", "steps"],
} as const;

const SYSTEM_PROMPT = `Convert the user's prompt into a structured multi-step timer sequence.
Return ONLY valid JSON matching the schema.
Each step must have: id (short unique string), title (short label), durationSeconds (integer >= 0; 0 means count-up), type (one of: work|rest|prep|cooldown|step|flow), optional metadata (e.g. temperature), optional color (hex).
Order steps chronologically. Use sensible defaults if the prompt is vague.`;

const VALID_TYPES = new Set([
  "work",
  "rest",
  "prep",
  "cooldown",
  "step",
  "flow",
]);

function shortId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function mockParsePrompt(prompt: string): GeneratedTimer {
  const steps: TimerStep[] = [];
  const regex = /(\d+(?:\.\d+)?)\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)\b/gi;
  const matches = [...prompt.matchAll(regex)];
  let idx = 0;
  for (const m of matches) {
    const value = parseFloat(m[1]);
    const unit = m[2].toLowerCase();
    let secs = value;
    if (unit.startsWith("m") && !unit.startsWith("ms") && unit !== "ms") {
      if (unit === "min" || unit === "mins" || unit === "minutes" || unit === "m") {
        secs = value * 60;
      }
    }
    if (unit.startsWith("h")) secs = value * 3600;
    if (unit === "s" || unit === "sec" || unit === "secs" || unit === "seconds") {
      secs = value;
    }
    secs = Math.max(0, Math.round(secs));
    idx++;
    steps.push({
      id: String(idx),
      title: `Step ${idx}`,
      durationSeconds: secs,
      type: "step",
      color: `hsl(${(idx * 67) % 360}, 70%, 50%)`,
    });
  }
  if (steps.length === 0) {
    steps.push({
      id: "1",
      title: "Default",
      durationSeconds: 300,
      type: "step",
      color: "#22c55e",
    });
  }
  return {
    title: "Custom Timer",
    description: `Generated from: ${prompt}`,
    steps,
  };
}

function sanitize(raw: GeneratedTimer): GeneratedTimer {
  const safeTitle = (raw.title ?? "Custom Timer").slice(0, 120);
  const safeDesc = (raw.description ?? "").slice(0, 500);
  const steps: TimerStep[] = (raw.steps ?? [])
    .filter((s) => s && typeof s.durationSeconds === "number")
    .map((s, i) => ({
      id: typeof s.id === "string" && s.id.length ? s.id : shortId(),
      title: (s.title ?? `Step ${i + 1}`).slice(0, 80),
      durationSeconds: Math.max(0, Math.round(s.durationSeconds)),
      type: (VALID_TYPES.has(s.type) ? s.type : "step") as TimerStep["type"],
      metadata: s.metadata && typeof s.metadata === "object" ? s.metadata : undefined,
      color:
        typeof s.color === "string" && s.color.startsWith("#")
          ? s.color
          : `hsl(${(i * 67) % 360}, 70%, 50%)`,
    }));
  if (steps.length === 0) {
    steps.push({
      id: shortId(),
      title: "Default",
      durationSeconds: 300,
      type: "step",
      color: "#22c55e",
    });
  }
  return { title: safeTitle, description: safeDesc, steps };
}

export async function generateTimerFromPrompt(
  prompt: string,
  apiKey?: string,
): Promise<GeneratedTimer> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key || !prompt.trim()) {
    return mockParsePrompt(prompt);
  }
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: TIMER_RESPONSE_SCHEMA as unknown as object,
      },
    });
    const result = await model.generateContent(
      `${SYSTEM_PROMPT}\n\nUser prompt: ${prompt}`,
    );
    const text = result.response.text();
    const parsed = JSON.parse(text) as GeneratedTimer;
    return sanitize(parsed);
  } catch {
    return mockParsePrompt(prompt);
  }
}
