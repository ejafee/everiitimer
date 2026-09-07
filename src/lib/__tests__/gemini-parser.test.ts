import { describe, it, expect } from "vitest";
import { mockParsePrompt } from "../gemini";

describe("mockParsePrompt", () => {
  it("parses minutes with 'min'", () => {
    const r = mockParsePrompt("Cook 10 min sear, then 5 min rest");
    expect(r.steps.length).toBe(2);
    expect(r.steps[0].durationSeconds).toBe(600);
    expect(r.steps[1].durationSeconds).toBe(300);
  });

  it("parses 'minutes' plural and 'm' shorthand", () => {
    const r = mockParsePrompt("Warm-up 5 minutes, work 20m, cool 3 mins");
    expect(r.steps.length).toBe(3);
    expect(r.steps[0].durationSeconds).toBe(300);
    expect(r.steps[1].durationSeconds).toBe(1200);
    expect(r.steps[2].durationSeconds).toBe(180);
  });

  it("parses seconds", () => {
    const r = mockParsePrompt("Sprint 30 seconds, walk 60 secs");
    expect(r.steps[0].durationSeconds).toBe(30);
    expect(r.steps[1].durationSeconds).toBe(60);
  });

  it("parses hours", () => {
    const r = mockParsePrompt("Deep work 2 hours, break 15 min");
    expect(r.steps[0].durationSeconds).toBe(7200);
    expect(r.steps[1].durationSeconds).toBe(900);
  });

  it("falls back to a 5-minute default when no durations found", () => {
    const r = mockParsePrompt("Just chill for a bit");
    expect(r.steps).toHaveLength(1);
    expect(r.steps[0].durationSeconds).toBe(300);
  });

  it("returns title and description echoing the prompt", () => {
    const r = mockParsePrompt("Run 10 min walk 5 min");
    expect(r.title).toBe("Custom Timer");
    expect(r.description).toContain("Run 10 min walk 5 min");
  });

  it("assigns unique ids and colors per step", () => {
    const r = mockParsePrompt("5 min, 5 min, 5 min");
    expect(new Set(r.steps.map((s) => s.id)).size).toBe(3);
    expect(new Set(r.steps.map((s) => s.color)).size).toBe(3);
  });
});
